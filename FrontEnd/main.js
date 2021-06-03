'use strict';

// const baseUrl = 'http://localhost:5001/tinder-netflix/us-central1';
const baseUrl = 'https://us-central1-tinder-netflix.cloudfunctions.net';
const storage = window.localStorage;


function createAlert(content, type, time) {
  type = type.toLowerCase();
  let svgStr='';
  switch (type) {
    case 'danger':
      svgStr = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
      break;
    case 'success':
      svgStr = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>';
      break;
    case 'info':
      svgStr = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>';
      break;
    case 'warning':
      svgStr = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
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
  document.getElementById('alertContainer').appendChild(div);
  $(`#${now}`).fadeTo(time*1000, 100).slideUp(500, function() {
    $(`#${now}`).slideUp(500);
    document.getElementById(`${now}`).remove();
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
      createAlert(`Alert occurred while copying to clipboard`, 'danger', 7);
          // code block
  }
  navigator.clipboard.writeText(data);
  createAlert(`${text} copied to clipboard`, 'success', 7);
}

