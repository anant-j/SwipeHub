'use strict';

// const baseUrl = 'http://localhost:5001/theswipehub/us-central1';
const baseUrl = 'https://us-central1-theswipehub.cloudfunctions.net';
const hostUrl = window.location.hostname;
const storage = window.localStorage;
const sessionId = localStorage.getItem('SwipeHub_sessionId');
const userId = localStorage.getItem('SwipeHub_userId');
const globalAlertStore = {};

if (userId != undefined) {
  if (document.getElementById('userIdPlaceholder') != null) {
    document.getElementById(
        'userIdPlaceholder',
    ).innerHTML = `User ID: <b>${userId}</b>`;
  }
  if (document.getElementById('joinUserId') != null) {
    document.getElementById('joinUserId').value = `${userId}`;
  }
  if (document.getElementById('createUserId') != null) {
    document.getElementById('createUserId').value = `${userId}`;
  }
}
if (sessionId != undefined) {
  if (document.getElementById('sessionIdPlaceholder') != null) {
    document.getElementById(
        'sessionIdPlaceholder',
    ).innerHTML = `Session ID: <b>${sessionId}</b>`;
  }
  if (document.getElementById('sessionId') != null) {
    document.getElementById('sessionId').value = `${sessionId}`;
  }
}

function createAlert(content, type, time) {
  type = type.toLowerCase();
  let svgStr = '';
  switch (type) {
    case 'danger':
      svgStr =
        '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
      break;
    case 'success':
      svgStr =
        '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>';
      break;
    case 'info':
      svgStr =
        '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>';
      break;
    case 'warning':
      svgStr =
        '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
      break;
    default:
      console.log('Error while raising alert');
      return;
    // code block
  }
  const date = new Date();
  const now = date.getTime().toString();
  const div = document.createElement('div');
  div.id = now;
  div.innerHTML = `${svgStr}<div>${content}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  div.className = `alert alert-${type} d-flex align-items-center alert-dismissible fade show mt-3`;
  div.role = 'alert';
  if (globalAlertStore[content] == undefined) {
    globalAlertStore[content] = false;
  }
  if (!globalAlertStore[content]) {
    globalAlertStore[content] = true;
    document.getElementById('alertContainer').prepend(div);
  }
  $(`#${now}`)
      .fadeTo(time * 1000, 100)
      .slideUp(500, function() {
        $(`#${now}`).slideUp(500);
        document.getElementById(`${now}`).remove();
        globalAlertStore[content] = false;
      });
}

function showLoader() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('outer_container').style.display = 'none';
}

function hideLoader() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('outer_container').style.display = 'flex';
}

function copyToClipboard(item) {
  let data = '';
  let text = '';
  switch (item) {
    case 'userId':
      data = userId;
      text = 'User Id';
      break;
    case 'sessionId':
      data = sessionId;
      text = 'Session Id';
      break;
    default:
      createAlert('Alert occurred while copying to clipboard', 'danger', 7);
    // code block
  }
  navigator.clipboard.writeText(data);
  createAlert(`${text} copied to clipboard`, 'success', 7);
}

function createShareLink() {
  const joinLink = `${hostUrl}/?join=${sessionId}`;
  navigator.clipboard.writeText(joinLink);
  createAlert(`Shareable link copied to clipboard.`, 'success', 7);
}
function openPage(inp) {
  let page = '';
  switch (inp) {
    case 'home':
      page = './index.html';
      document.location.href = page;
      return;
      break;
    case 'session':
      page = './session.html';
      break;
    case 'match':
      if (globalLikeBuffer != undefined && globalLikeBuffer.size > 0) {
        createAlert('please wait', 'success', 5);
        poll();
      }
      page = './match.html';
      break;
    default:
      page = './index.html';
      break;
  }
  if (sessionId != null && userId != null) {
    document.location.href = page;
  } else {
    createAlert('Please create or join a session first', 'danger', 7);
  }
}

function javascriptAbort() {
  throw new Error('This is not an error. This is just to abort javascript');
}

function removeFromSet(originalSet, toBeRemoved) {
  const copyOfOriginal = originalSet;
  toBeRemoved.forEach((element) => {
    copyOfOriginal.delete(element);
  });
  return copyOfOriginal;
}

function leaveSession() {
  showLoader();
  const xhr = new XMLHttpRequest();
  xhr.open(
      'GET',
      `${baseUrl}/leaveSession?id=${sessionId}&user=${userId}`,
      true,
  );
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
      }
    }
  };
  hideLoader();
  storage.removeItem('SwipeHub_sessionId');
  storage.removeItem('SwipeHub_userId');
  document.location.href = './index.html';

  xhr.send(null);
}

function toArray(inp) {
  return Array.from(inp);
}

function toSet(inp) {
  return new Set(inp);
}
