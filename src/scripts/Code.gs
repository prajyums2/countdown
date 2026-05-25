/**
 * Google Apps Script — Countdown Journey Tracker + Snaps
 *
 * Sheet tabs: config, stations, milestones, snaps
 * Snaps columns: id, fileId, senderId, timestamp, status, allowance, view_count
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
      case "addStation": return jsonResponse(addStation(ss, payload));
      case "updateStation": updateStation(ss, payload); return jsonResponse({ success: true });
      case "deleteStation": deleteStation(ss, payload.id); return jsonResponse({ success: true });
      case "reorderStations": reorderStations(ss, payload.ids); return jsonResponse({ success: true });
      case "addMilestone": return jsonResponse(addMilestone(ss, payload));
      case "updateMilestone": updateMilestone(ss, payload); return jsonResponse({ success: true });
      case "deleteMilestone": deleteMilestone(ss, payload.id); return jsonResponse({ success: true });
      case "updateConfig": updateConfig(ss, payload); return jsonResponse({ success: true });
      case "addSnap": return jsonResponse(addSnap(ss, payload));
      case "getSnaps": return jsonResponse(getSnaps(ss, payload));
      case "getSnapContent": return jsonResponse(getSnapContent(ss, payload));
      case "updateSnapView": return jsonResponse(updateSnapView(ss, payload));
      default: return jsonError("Unknown action");
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
  for (let i = 1; i < rows.length; i++) obj[rows[i][0]] = rows[i][1];
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
  for (let i = 1; i < rows.length; i++) map[rows[i][0]] = i + 1;
  const updates = {
    start_location: config.startLocation,
    end_location: config.endLocation,
    train_boarding_date: config.trainBoardingDate,
    arrival_date: config.arrivalDate,
  };
  Object.entries(updates).forEach(([key, val]) => {
    if (map[key]) sheet.getRange(map[key], 2).setValue(val);
  });
}

// ─── Stations ────────────────────────────────────────────────

function getStations(ss) {
  const sheet = ss.getSheetByName("stations");
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
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
  sheet.appendRow([id, payload.name || "", payload.emoji || "", payload.dateTime || "", payload.description || "", payload.imageUrl || "", payload.orderIndex || 1, payload.eventType || "normal", payload.customMessage || "", payload.spotifyUrl || ""]);
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
    if (String(rows[i][0]) === id) { sheet.deleteRow(i + 1); return; }
  }
  throw new Error("Station not found: " + id);
}

function reorderStations(ss, ids) {
  const sheet = ss.getSheetByName("stations");
  if (!sheet) throw new Error("stations sheet not found");
  ids.forEach((id, idx) => {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === id) { sheet.getRange(i + 1, 7).setValue(idx + 1); break; }
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
  sheet.appendRow([id, payload.date || "", payload.title || "", payload.description || "", payload.icon || "salary", payload.imageUrl || ""]);
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
    if (String(rows[i][0]) === id) { sheet.deleteRow(i + 1); return; }
  }
  throw new Error("Milestone not found: " + id);
}

// ─── Snaps ───────────────────────────────────────────────────

function ensureSnapsSheet(ss) {
  let sheet = ss.getSheetByName("snaps");
  if (!sheet) {
    sheet = ss.insertSheet("snaps");
    sheet.appendRow(["id", "fileId", "senderId", "timestamp", "status", "allowance", "view_count"]);
  }
  return sheet;
}

function addSnap(ss, payload) {
  const sheet = ensureSnapsSheet(ss);
  const id = "snap_" + Date.now();
  const fileId = createDriveFile(id, payload.encryptedContent);
  const now = new Date().toISOString();
  sheet.appendRow([id, fileId, payload.senderId, now, "unread", payload.allowance, 0]);
  return { id, fileId };
}

function createDriveFile(snapId, content) {
  const folder = getSnapsFolder();
  const file = DriveApp.createFile(snapId + ".txt", content, "text/plain");
  file.setParents([folder]);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getId();
}

function getSnapsFolder() {
  const folders = DriveApp.getFoldersByName("countdown_snaps");
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder("countdown_snaps");
}

function getSnaps(ss, payload) {
  const sheet = ss.getSheetByName("snaps");
  if (!sheet) return { snaps: [] };
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { snaps: [] };
  const snaps = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    snaps.push({
      id: String(rows[i][0]),
      fileId: String(rows[i][1]),
      senderId: String(rows[i][2]),
      timestamp: String(rows[i][3]),
      status: String(rows[i][4]),
      allowance: String(rows[i][5]),
      view_count: Number(rows[i][6]) || 0,
    });
  }
  if (payload && payload.identity) {
    return { snaps: snaps.filter((s) => s.senderId !== payload.identity) };
  }
  return { snaps };
}

function getSnapContent(ss, payload) {
  const sheet = ss.getSheetByName("snaps");
  if (!sheet) throw new Error("snaps sheet not found");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === payload.fileId) {
      const file = DriveApp.getFileById(payload.fileId);
      const content = file.getBlob().getDataAsString();
      return {
        content,
        snap: {
          id: String(rows[i][0]),
          fileId: String(rows[i][1]),
          senderId: String(rows[i][2]),
          timestamp: String(rows[i][3]),
          status: String(rows[i][4]),
          allowance: String(rows[i][5]),
          view_count: Number(rows[i][6]) || 0,
        },
      };
    }
  }
  throw new Error("Snap not found for fileId: " + payload.fileId);
}

function updateSnapView(ss, payload) {
  const sheet = ss.getSheetByName("snaps");
  if (!sheet) throw new Error("snaps sheet not found");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === payload.snapId) {
      const r = i + 1;
      const currentCount = Number(rows[i][6]) || 0;
      const newCount = currentCount + 1;
      const allowance = String(rows[i][5]);
      const maxViews = allowance === "once" ? 1 : allowance === "twice" ? 2 : Infinity;
      sheet.getRange(r, 7).setValue(newCount);
      if (newCount >= maxViews) {
        sheet.getRange(r, 5).setValue("viewed");
      }
      return { success: true, view_count: newCount, status: newCount >= maxViews ? "viewed" : "unread" };
    }
  }
  throw new Error("Snap not found: " + payload.snapId);
}

function cleanupOldSnaps() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("snaps");
  if (!sheet) return;
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return;
  const now = Date.now();
  const maxAge = 48 * 60 * 60 * 1000;
  const toDelete = [];
  for (let i = rows.length - 1; i >= 1; i--) {
    if (!rows[i][0]) continue;
    const timestamp = new Date(rows[i][3]).getTime();
    const allowance = String(rows[i][5]);
    if (now - timestamp > maxAge && allowance !== "keep") {
      toDelete.push(i);
    }
  }
  toDelete.forEach((rowIdx) => {
    try {
      const fileId = String(rows[rowIdx][1]);
      if (fileId) DriveApp.getFileById(fileId).setTrashed(true);
    } catch (e) {}
    sheet.deleteRow(rowIdx + 1);
  });
}

// ─── Helpers ─────────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function jsonError(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg })).setMimeType(ContentService.MimeType.JSON);
}
