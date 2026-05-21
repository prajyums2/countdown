/**
 * Google Apps Script — Countdown Journey Tracker
 *
 * Deploy as Web App: Extensions → Apps Script → Deploy → New Deployment
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Sheet must have 3 tabs: config, stations, milestones
 * See README for column layout.
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const data = {
      config: getConfig(ss),
      stations: getStations(ss),
      milestones: getMilestones(ss),
    };
    return jsonResponse(data);
  } catch (e) {
    return jsonError(String(e));
  }
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const { action, payload } = JSON.parse(e.postData.contents);

    switch (action) {
      case "addStation":
        return jsonResponse(addStation(ss, payload));
      case "updateStation":
        updateStation(ss, payload);
        return jsonResponse({ success: true });
      case "deleteStation":
        deleteStation(ss, payload.id);
        return jsonResponse({ success: true });
      case "reorderStations":
        reorderStations(ss, payload.ids);
        return jsonResponse({ success: true });
      case "addMilestone":
        return jsonResponse(addMilestone(ss, payload));
      case "updateMilestone":
        updateMilestone(ss, payload);
        return jsonResponse({ success: true });
      case "deleteMilestone":
        deleteMilestone(ss, payload.id);
        return jsonResponse({ success: true });
      case "updateConfig":
        updateConfig(ss, payload);
        return jsonResponse({ success: true });
      default:
        return jsonError("Unknown action");
    }
  } catch (e) {
    return jsonError(String(e));
  }
}

// ─── Config ──────────────────────────────────────────────────

function getConfig(ss) {
  const sheet = ss.getSheetByName("config");
  if (!sheet) return null;
  const rows = sheet.getDataRange().getValues();
  const obj = {};
  for (let i = 1; i < rows.length; i++) {
    obj[rows[i][0]] = rows[i][1];
  }
  return {
    startLocation: obj.start_location || "",
    endLocation: obj.end_location || "",
    trainBoardingDate: obj.train_boarding_date || "",
    arrivalDate: obj.arrival_date || "",
  };
}

function updateConfig(ss, config) {
  const sheet = ss.getSheetByName("config");
  if (!sheet) throw new Error("config sheet not found");
  const rows = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    map[rows[i][0]] = i + 1;
  }
  const updates = {
    start_location: config.startLocation,
    end_location: config.endLocation,
    train_boarding_date: config.trainBoardingDate,
    arrival_date: config.arrivalDate,
  };
  Object.entries(updates).forEach(([key, val]) => {
    if (map[key]) {
      sheet.getRange(map[key], 2).setValue(val);
    }
  });
}

// ─── Stations ────────────────────────────────────────────────

function getStations(ss) {
  const sheet = ss.getSheetByName("stations");
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    result.push({
      id: String(rows[i][0]),
      name: String(rows[i][1] || ""),
      emoji: String(rows[i][2] || ""),
      dateTime: String(rows[i][3] || ""),
      description: String(rows[i][4] || ""),
      imageUrl: String(rows[i][5] || ""),
      orderIndex: Number(rows[i][6]) || 0,
      eventType: String(rows[i][7] || "normal"),
      customMessage: String(rows[i][8] || ""),
      spotifyUrl: String(rows[i][9] || ""),
    });
  }
  return result;
}

function addStation(ss, payload) {
  const sheet = ss.getSheetByName("stations");
  if (!sheet) throw new Error("stations sheet not found");
  const id = "s" + Date.now();
  const row = [
    id,
    payload.name || "",
    payload.emoji || "",
    payload.dateTime || "",
    payload.description || "",
    payload.imageUrl || "",
    payload.orderIndex || 1,
    payload.eventType || "normal",
    payload.customMessage || "",
    payload.spotifyUrl || "",
  ];
  sheet.appendRow(row);
  return { id, ...payload };
}

function updateStation(ss, payload) {
  const sheet = ss.getSheetByName("stations");
  if (!sheet) throw new Error("stations sheet not found");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === payload.id) {
      const r = i + 1;
      sheet.getRange(r, 2).setValue(payload.name || "");
      sheet.getRange(r, 3).setValue(payload.emoji || "");
      sheet.getRange(r, 4).setValue(payload.dateTime || "");
      sheet.getRange(r, 5).setValue(payload.description || "");
      sheet.getRange(r, 6).setValue(payload.imageUrl || "");
      sheet.getRange(r, 7).setValue(payload.orderIndex || 1);
      sheet.getRange(r, 8).setValue(payload.eventType || "normal");
      sheet.getRange(r, 9).setValue(payload.customMessage || "");
      sheet.getRange(r, 10).setValue(payload.spotifyUrl || "");
      return;
    }
  }
  throw new Error("Station not found: " + payload.id);
}

function deleteStation(ss, id) {
  const sheet = ss.getSheetByName("stations");
  if (!sheet) throw new Error("stations sheet not found");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("Station not found: " + id);
}

function reorderStations(ss, ids) {
  const sheet = ss.getSheetByName("stations");
  if (!sheet) throw new Error("stations sheet not found");
  ids.forEach((id, idx) => {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === id) {
        sheet.getRange(i + 1, 7).setValue(idx + 1);
        break;
      }
    }
  });
}

// ─── Milestones ──────────────────────────────────────────────

function getMilestones(ss) {
  const sheet = ss.getSheetByName("milestones");
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    result.push({
      id: String(rows[i][0]),
      date: String(rows[i][1] || ""),
      title: String(rows[i][2] || ""),
      description: String(rows[i][3] || ""),
      icon: String(rows[i][4] || "salary"),
      imageUrl: String(rows[i][5] || ""),
    });
  }
  return result;
}

function addMilestone(ss, payload) {
  const sheet = ss.getSheetByName("milestones");
  if (!sheet) throw new Error("milestones sheet not found");
  const id = "m" + Date.now();
  const row = [
    id,
    payload.date || "",
    payload.title || "",
    payload.description || "",
    payload.icon || "salary",
    payload.imageUrl || "",
  ];
  sheet.appendRow(row);
  return { id, ...payload };
}

function updateMilestone(ss, payload) {
  const sheet = ss.getSheetByName("milestones");
  if (!sheet) throw new Error("milestones sheet not found");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === payload.id) {
      const r = i + 1;
      sheet.getRange(r, 2).setValue(payload.date || "");
      sheet.getRange(r, 3).setValue(payload.title || "");
      sheet.getRange(r, 4).setValue(payload.description || "");
      sheet.getRange(r, 5).setValue(payload.icon || "salary");
      sheet.getRange(r, 6).setValue(payload.imageUrl || "");
      return;
    }
  }
  throw new Error("Milestone not found: " + payload.id);
}

function deleteMilestone(ss, id) {
  const sheet = ss.getSheetByName("milestones");
  if (!sheet) throw new Error("milestones sheet not found");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("Milestone not found: " + id);
}

// ─── Helpers ─────────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService.createTextOutput(
    JSON.stringify(data)
  ).setMimeType(ContentService.MimeType.JSON);
}

function jsonError(msg) {
  return ContentService.createTextOutput(
    JSON.stringify({ error: msg })
  ).setMimeType(ContentService.MimeType.JSON);
}
