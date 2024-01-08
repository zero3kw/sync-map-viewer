const uid = Math.random().toString(32).substring(2);
const wss = new WebSocket("wss://cloud.achex.ca/ce5c2a5e724366e353b5ba795de04059");

const map = L.map('map');
L.control.scale({imperial: false, metric: true}).addTo(map);

let latestReceivedTimestamp = Date.now();

// 現在のURLを取得
const currentURL = window.location.href;

// URLからパラメータ部分を取得
const urlParams = new URLSearchParams(currentURL.substring(currentURL.indexOf('?')));

// 特定のパラメータを取得
const hubNameParam = urlParams.get('hubName');

// パラメータが空の場合にデフォルト値をセット
const defaultValue = "あいことば";
const hubName = hubNameParam || defaultValue;

// パラメータの値を表示
// console.log('hubNameパラメータの値: ' + hubName);

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

wss.onopen = () => {
  wss.send(JSON.stringify({ "auth": uid, "password": "" }));
  wss.send(JSON.stringify({ "joinHub": hubName }));
};

wss.onmessage = (event) => {
  const obj = JSON.parse(event.data);
  if (obj.FROM !== uid && obj.lat && obj.lng && obj.zoom) {
    latestReceivedTimestamp = Date.now();
    map.flyTo([obj.lat, obj.lng], obj.zoom);
  }
};

function getMapInfo() {
  const pos = map.getCenter();
  const zoom = map.getZoom();
  if (Date.now() - latestReceivedTimestamp > 1000) {
    wss.send(JSON.stringify({ "toH": hubName, "lat": pos.lat, "lng": pos.lng, "zoom": zoom, "timestamp": Date.now() }));
  }
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

// GeoJSONからcoordinatesを取得する
const extractCoordinates = (geojson) => {
  const features = geojson.map(item => item.geometry.coordinates.reverse());
  return features[0];
};


let cross = L.divIcon({ // CSSを使ったDivIconを作成
	className: 'cross',
	bgPos: [18, 18]
});
let crossMark = L.marker(map.getCenter(), { // マーカとして登録
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
