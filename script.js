const uid = crypto.randomUUID();
const WSS_URL = "wss://cloud.achex.ca/ce5c2a5e724366e353b5ba795de04059";
let wss;
let reconnectDelay = 1000;
let heartbeatTimer;

function safeSend(payload) {
  if (wss && wss.readyState === WebSocket.OPEN) {
    wss.send(JSON.stringify(payload));
  }
}

function connect() {
  const socket = new WebSocket(WSS_URL);
  wss = socket;

  socket.onopen = () => {
    reconnectDelay = 1000;
    socket.send(JSON.stringify({ "auth": uid, "password": "" }));
    socket.send(JSON.stringify({ "joinHub": hubName }));
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => safeSend({ "ltcy": Date.now() }), 30000);
    // 参加直後にハブの現在状態をリクエスト
    setTimeout(() => safeSend({ "toH": hubName, "request": 1 }), 500);
  };

  socket.onmessage = (event) => {
    const obj = JSON.parse(event.data);
    if (obj.FROM === uid) return;

    // 他人からの状態リクエストに自分の現在地を返す
    if (obj.request) {
      const pos = map.getCenter();
      safeSend({ "toH": hubName, "lat": pos.lat, "lng": pos.lng, "zoom": map.getZoom() });
      return;
    }

    if (obj.lat && obj.lng && obj.zoom) {
      lastReceived = { lat: obj.lat, lng: obj.lng, zoom: obj.zoom };
      map.flyTo([obj.lat, obj.lng], obj.zoom);
    }
  };

  socket.onclose = () => {
    if (socket !== wss) return;
    clearInterval(heartbeatTimer);
    setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
  };

  socket.onerror = () => socket.close();
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && wss.readyState !== WebSocket.OPEN) {
    reconnectDelay = 1000;
    connect();
  }
});

window.addEventListener('online', () => {
  if (wss.readyState !== WebSocket.OPEN) {
    reconnectDelay = 1000;
    connect();
  }
});

const map = L.map('map');
L.control.scale({imperial: false, metric: true}).addTo(map);

let lastReceived = null;

// 現在のURLを取得
const currentURL = window.location.href;

// URLからパラメータ部分を取得
const urlParams = new URLSearchParams(currentURL.substring(currentURL.indexOf('?')));

// 特定のパラメータを取得
const hubNameParam = urlParams.get('hubName');

// パラメータが空の場合にデフォルト値をセット
const defaultValue = "あいことば";
const hubName = hubNameParam || defaultValue;

////////////////////////////////////////////////////////////////////////////////
//マップタイルの定義
L.control.layers({
  "淡色地図": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
    attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html'>地理院タイル</a>"
  }).addTo(map),
  "標準地図": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
    attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html'>地理院タイル</a>"
  }),
  "色別標高図": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png", {
    attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html'>地理院タイル</a>"
  }),
  "写真": L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg", {
    attribution: "<a href='http://maps.gsi.go.jp/development/ichiran.html'>地理院タイル</a>"
  }),
  "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
  })
}, null, {position: "topleft"}).addTo(map);

map.setView([35.679531, 139.736914], 14);

map.on('zoomend', getMapInfo);
map.on('moveend', getMapInfo);

connect();

function getMapInfo() {
  const pos = map.getCenter();
  const zoom = map.getZoom();
  // 現在位置が最後の受信と一致 → echo なのでスキップ
  if (lastReceived &&
      Math.abs(pos.lat - lastReceived.lat) < 1e-7 &&
      Math.abs(pos.lng - lastReceived.lng) < 1e-7 &&
      zoom === lastReceived.zoom) {
    return;
  }
  safeSend({ "toH": hubName, "lat": pos.lat, "lng": pos.lng, "zoom": zoom });
}

////////////////////////////////////////////////////////////////////////////////
// 検索ボックスの処理
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');

const searchAddress = async (query) => {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const coordinates = extractCoordinates(data);
    map.flyTo(coordinates, 15);
    searchInput.value = '';
  } catch (error) {
    console.error('住所検索エラー:', error);
  }
};

const performSearch = () => {
  const query = searchInput.value;
  if (!query) {
    return; // Skip processing if the query is empty
  }
  searchAddress(query);
};

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

// GeoJSONから先頭要素の座標を [lat, lng] で取得する
const extractCoordinates = (geojson) => {
  const [lng, lat] = geojson[0].geometry.coordinates;
  return [lat, lng];
};


const cross = L.divIcon({
	className: 'cross',
	bgPos: [18, 18]
});
const crossMark = L.marker(map.getCenter(), {
	icon: cross, zIndexOffset: 100, interactive: false
}).addTo(map);
map.on('move', function() { // mousemoveイベントでマーカを移動
	crossMark.setLatLng(map.getCenter());
});

// QRコードを生成する要素を取得
const qrcodeElement = document.getElementById('qrcode');

// QRコード生成オプションを設定
const qrcodeOptions = {
  text: currentURL, // QRコードに変換するテキスト
  width: 100,       // QRコードの幅
  height: 100,       // QRコードの高さ
  correctLevel: QRCode.CorrectLevel.L // 誤り訂正レベル
  };

// QRコードを生成して要素に表示
const qrcode = new QRCode(qrcodeElement, qrcodeOptions);
