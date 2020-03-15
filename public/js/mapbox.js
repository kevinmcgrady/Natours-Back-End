export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2V2aW5tY2dyYWR5NDciLCJhIjoiY2o3cnh5cXVvM3VlcTJ3cWtuam91djczdiJ9.GWEegcrqrRlCd_Qz0f_zDg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kevinmcgrady47/ck7ruld102nme1ip1obx3rrbu',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day} ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
