/* eslint-disable */

export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXNtb3ZpYyIsImEiOiJja3VtcmpyZngwZGlkMnZvYWRsNzY4MG4zIn0.t2H1QjoulaBBrUAxpgE7ow';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/asmovic/ckumtf0041qs917o7lxrmyvrz',
        scrollZoom: false
        /* center: [3.349149, 6.605874],
        zoom: 10 */
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc=>{
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';
    
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);
    
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<P>Day ${loc.day}: ${loc.description}</P>`)
        .addTo(map);
    
        // Extend map bounds to include current Location
        bounds.extend(loc.coordinates);
    });
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 180,
            right: 100,
            left: 100
        }
    });
}
