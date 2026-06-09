var CONFIG = {
  SCENARIOS_SHEET: "scenarios",
  MARKET_SHEET: "marketStores",
  WRITE_KEY_PROPERTY: "WRITE_KEY"
};

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var callback = params.callback || "";
  var response;

  try {
    response = handleAction(params);
  } catch (error) {
    response = {
      status: "error",
      message: error && error.message ? error.message : String(error)
    };
  }

  var output = callback
    ? callback + "(" + JSON.stringify(response) + ");"
    : JSON.stringify(response);

  return ContentService
    .createTextOutput(output)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function handleAction(params) {
  var action = params.action || "";
  ensureSheets();

  if (isWriteAction(action)) {
    verifyWriteKey(params.writeKey || "");
  }

  switch (action) {
    case "listScenarios":
      return { status: "ok", scenarios: listRows(CONFIG.SCENARIOS_SHEET) };
    case "addScenario":
      upsertScenario(params, true);
      return { status: "ok", scenarios: listRows(CONFIG.SCENARIOS_SHEET) };
    case "updateScenario":
      upsertScenario(params, false);
      return { status: "ok", scenarios: listRows(CONFIG.SCENARIOS_SHEET) };
    case "deleteScenario":
      softDelete(CONFIG.SCENARIOS_SHEET, params.id);
      return { status: "ok", scenarios: listRows(CONFIG.SCENARIOS_SHEET) };
    case "listMarketStores":
      return { status: "ok", marketStores: listRows(CONFIG.MARKET_SHEET) };
    case "addMarketStore":
      upsertMarketStore(params, true);
      return { status: "ok", marketStores: listRows(CONFIG.MARKET_SHEET) };
    case "updateMarketStore":
      upsertMarketStore(params, false);
      return { status: "ok", marketStores: listRows(CONFIG.MARKET_SHEET) };
    case "deleteMarketStore":
      softDelete(CONFIG.MARKET_SHEET, params.id);
      return { status: "ok", marketStores: listRows(CONFIG.MARKET_SHEET) };
    default:
      return { status: "error", message: "Unknown action: " + action };
  }
}

function ensureSheets() {
  ensureSheet(CONFIG.SCENARIOS_SHEET, [
    "id", "name", "dataJson", "updatedAt", "updatedBy", "isDeleted"
  ]);
  ensureSheet(CONFIG.MARKET_SHEET, [
    "id", "nameKo", "nameZh", "categoryKo", "categoryZh", "monthlyRevenue",
    "peakMonthlyRevenue", "avgOrderValue", "conversion", "margin", "noteKo",
    "noteZh", "updatedAt", "isDeleted"
  ]);
  seedMarketStores();
}

function ensureSheet(name, headers) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }
  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (current.join(",") !== headers.join(",")) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function listRows(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var headers = values[0];
  var rows = [];

  for (var rowIndex = 1; rowIndex < values.length; rowIndex++) {
    var row = {};
    for (var colIndex = 0; colIndex < headers.length; colIndex++) {
      var key = headers[colIndex];
      row[key] = normalizeValue(values[rowIndex][colIndex]);
    }
    if (row.isDeleted !== true && row.isDeleted !== "TRUE") rows.push(row);
  }

  rows.sort(function (a, b) {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  return rows;
}

function upsertScenario(params, isAdd) {
  var now = new Date().toISOString();
  var row = [
    required(params.id, "id"),
    required(params.name, "name"),
    required(params.dataJson, "dataJson"),
    now,
    params.updatedBy || "browser",
    false
  ];
  upsertRow(CONFIG.SCENARIOS_SHEET, params.id, row, isAdd);
}

function upsertMarketStore(params, isAdd) {
  var now = new Date().toISOString();
  var row = [
    required(params.id, "id"),
    params.nameKo || "",
    params.nameZh || "",
    params.categoryKo || "",
    params.categoryZh || "",
    numberValue(params.monthlyRevenue),
    numberValue(params.peakMonthlyRevenue),
    numberValue(params.avgOrderValue),
    numberValue(params.conversion),
    numberValue(params.margin),
    params.noteKo || "",
    params.noteZh || "",
    now,
    false
  ];
  upsertRow(CONFIG.MARKET_SHEET, params.id, row, isAdd);
}

function upsertRow(sheetName, id, row, isAdd) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var rowNumber = findRowById(sheet, id);
  if (rowNumber === -1) {
    sheet.appendRow(row);
    return;
  }
  if (isAdd) {
    sheet.appendRow(row);
    return;
  }
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
}

function softDelete(sheetName, id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var rowNumber = findRowById(sheet, required(id, "id"));
  if (rowNumber === -1) return;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var isDeletedCol = headers.indexOf("isDeleted") + 1;
  var updatedAtCol = headers.indexOf("updatedAt") + 1;
  sheet.getRange(rowNumber, isDeletedCol).setValue(true);
  if (updatedAtCol > 0) sheet.getRange(rowNumber, updatedAtCol).setValue(new Date().toISOString());
}

function findRowById(sheet, id) {
  if (!sheet || sheet.getLastRow() < 2) return -1;
  var ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var index = 0; index < ids.length; index++) {
    if (String(ids[index][0]) === String(id)) return index + 2;
  }
  return -1;
}

function isWriteAction(action) {
  return [
    "addScenario", "updateScenario", "deleteScenario",
    "addMarketStore", "updateMarketStore", "deleteMarketStore"
  ].indexOf(action) !== -1;
}

function verifyWriteKey(provided) {
  var expected = PropertiesService.getScriptProperties().getProperty(CONFIG.WRITE_KEY_PROPERTY);
  if (!expected) return;
  if (String(provided) !== expected) {
    throw new Error("Invalid writeKey");
  }
}

function required(value, name) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error("Missing required field: " + name);
  }
  return value;
}

function numberValue(value) {
  var parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === "TRUE") return true;
  if (value === "FALSE") return false;
  return value;
}

function seedMarketStores() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.MARKET_SHEET);
  if (!sheet || sheet.getLastRow() > 1) return;
  var now = new Date().toISOString();
  var rows = [
    ["hetras_seongsu", "헤트라스 성수", "Hetras 圣水", "향/라이프스타일", "香氛/生活方式", 1500000000, 1800000000, 50000, 20, 65, "월 방문객수 150,000명 기준", "以月访客 150,000 人为基准", now, false],
    ["salt_bread", "자연도 소금빵", "自然岛盐面包", "디저트/베이커리", "甜点/烘焙", 420000000, 620000000, 16000, 18, 58, "회전율이 높은 베이커리형 매장", "周转率高的烘焙店型", now, false],
    ["dessert_bakery", "성수 디저트/베이커리형", "圣水甜点/烘焙型", "F&B", "餐饮", 250000000, 380000000, 22000, 14, 55, "표준 F&B 비교군", "标准餐饮对照组", now, false],
    ["beauty_flagship", "뷰티 플래그십/체험형", "美妆旗舰/体验型", "뷰티", "美妆", 520000000, 760000000, 68000, 10, 68, "체험 후 구매 전환형", "体验后转化购买型", now, false],
    ["lifestyle_goods", "잡화/라이프스타일형", "杂货/生活方式型", "리테일", "零售", 180000000, 260000000, 36000, 9, 52, "객단가와 재방문율 중심", "客单价与复访率中心", now, false],
    ["linkland_current", "링크랜드 현재 가정", "Linkland 当前假设", "임차 투자 가정", "租赁投资假设", 60000000, 90000000, 50000, 0.8, 62, "현재 계산기 기본 오프라인 매출 가정", "当前计算器默认线下销售假设", now, false]
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}
