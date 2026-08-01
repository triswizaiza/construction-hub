/**
 * Construction Hub - Google Apps Script Backend
 * Salin dan tempel kode ini ke Google Sheets (Extensions -> Apps Script)
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ambil data dari masing-masing Sheet
  const projectsSheet = getOrCreateSheet(ss, 'Projects');
  const boqSheet = getOrCreateSheet(ss, 'BOQ');
  const logsSheet = getOrCreateSheet(ss, 'SiteLogs');
  
  const projectsData = getSheetJSON(projectsSheet);
  const boqData = getSheetJSON(boqSheet);
  const logsData = getSheetJSON(logsSheet);

  const response = {
    status: 'success',
    projects: projectsData,
    boq: boqData,
    siteLogs: logsData,
    updatedAt: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (contents.projects) {
      const projectsSheet = getOrCreateSheet(ss, 'Projects');
      saveJSONToSheet(projectsSheet, contents.projects);
    }

    if (contents.boq) {
      const boqSheet = getOrCreateSheet(ss, 'BOQ');
      saveJSONToSheet(boqSheet, contents.boq);
    }

    if (contents.siteLogs) {
      const logsSheet = getOrCreateSheet(ss, 'SiteLogs');
      saveJSONToSheet(logsSheet, contents.siteLogs);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data berhasil disimpan ke Google Sheets' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== HELPER FUNCTIONS =====
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getSheetJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const jsonCell = data[1][0]; // JSON tersimpan di sel A2
  try {
    return JSON.parse(jsonCell);
  } catch (e) {
    return [];
  }
}

function saveJSONToSheet(sheet, jsonArray) {
  sheet.clear();
  sheet.appendRow(['Data JSON']);
  sheet.appendRow([JSON.stringify(jsonArray)]);
}
