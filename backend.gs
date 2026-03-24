/**
 * Google Apps Script 後端
 * 接收兩張表單的資料，分別寫入同一本試算表的不同工作表
 *
 * 部署步驟：
 *   1. 前往 https://script.google.com，新增專案
 *   2. 貼入此程式碼
 *   3. 修改第 12 行的 SPREADSHEET_ID（見下方說明）
 *   4. 點選「部署」→「新增部署作業」
 *      - 類型：Web 應用程式
 *      - 執行身分：我（你的 Google 帳號）
 *      - 誰可以存取：任何人
 *   5. 複製產生的「網路應用程式網址」
 *   6. 貼到 formA.html 與 formB.html 的 GAS_URL 變數
 *
 * 取得 SPREADSHEET_ID：
 *   先手動建立一本 Google 試算表，URL 中間那段即為 ID
 *   例：https://docs.google.com/spreadsheets/d/【這段】/edit
 */

const SPREADSHEET_ID = '1UVYO0FcFG0iWs5bhcWq7FXUoQT09FB7IoYFNsgrjiic';

const HEADERS_A = [
  '送出時間',
  '學會名稱', '聯絡窗口', '聯絡電話',
  '姓名', '執業院所', '職稱', '專科別',
  '聯絡電話（個人）', '手機', '傳真', 'Email',
  '參與意願／專長領域', '方便開會時間', '學經簡歷'
];

const HEADERS_B = [
  '送出時間',
  '學會名稱', '聯絡窗口', '聯絡電話',
  '姓名', '執業院所', '專科別',
  '聯絡電話（個人）', '手機', 'Email',
  '審查類別', '方便審查時間', '學經簡歷'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (data.formType === 'A') {
      writeRow(ss, '工作小組推薦', HEADERS_A, [
        data.submittedAt,
        data.orgName, data.contactName, data.contactPhone,
        data.pName, data.pHospital, data.pTitle, data.pSpecialty,
        data.pPhone, data.pMobile, data.pFax, data.pEmail,
        data.roles, data.availability, data.bio
      ]);
    } else if (data.formType === 'B') {
      writeRow(ss, '審查分組推薦', HEADERS_B, [
        data.submittedAt,
        data.orgName, data.contactName, data.contactPhone,
        data.pName, data.pHospital, data.pSpecialty,
        data.pPhone, data.pMobile, data.pEmail,
        data.categories, data.availability, data.bio
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeRow(ss, sheetName, headers, values) {
  let sheet = ss.getSheetByName(sheetName);

  // 工作表不存在時自動建立並寫入標題列
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);

    // 標題列格式
    const hdrRange = sheet.getRange(1, 1, 1, headers.length);
    hdrRange.setBackground('#1a4a6e');
    hdrRange.setFontColor('#ffffff');
    hdrRange.setFontWeight('bold');
    sheet.setFrozenRows(1);

    // 欄寬自動調整
    sheet.autoResizeColumns(1, headers.length);
  }

  sheet.appendRow(values);
}

// 測試用：直接在 Apps Script 編輯器執行此函式可驗證設定是否正確
function testSetup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('試算表名稱：' + ss.getName());
  Logger.log('✅ SPREADSHEET_ID 設定正確');
}
