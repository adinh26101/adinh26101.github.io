(() => {
  "use strict";

  // =========================================================
  // 1. INITIALIZATION
  // =========================================================

  const root = document.getElementById("geo-journal");

  if (!root || root.dataset.initialized === "true") return;

  root.dataset.initialized = "true";

  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];

  const MAP_STYLE =
    window.GEO_MAP_STYLE_URL ||
    "https://tiles.openfreemap.org/styles/liberty";

  // Resolve JSON paths relative to this JS file.
  const scriptURL = document.currentScript?.src;

  const DATA_BASE_URL = scriptURL
    ? new URL("../data/geo/", scriptURL).href
    : new URL(
        "assets/data/geo/",
        document.baseURI
      ).href;

  const REGION_FILES = {
    russia: "russia.json",
    china: "china.json",
    usa: "usa.json",
    europe: "europe.json",
    "middle-east": "middle-east.json",
    africa: "africa.json"
  };

  const CATEGORY_CONFIG = {
    terrain: {
      label: "Vùng địa hình",
      color: "#D8B56D",
      checkbox: "highlight-terrain"
    },
    countries: {
      label: "Quốc gia",
      color: "#6686A8",
      checkbox: "highlight-countries"
    },
    autonomous: {
      label: "Khu vực tự trị",
      color: "#B28BC5",
      checkbox: "highlight-autonomous"
    },
    strategic: {
      label: "Điểm chiến lược",
      color: "#729CB7",
      checkbox: "highlight-strategic"
    }
  };

  const HIGHLIGHT_SOURCE_ID = "geo-highlights";

  const HIGHLIGHT_CATEGORIES = Object.keys(CATEGORY_CONFIG);

  // Cache JSON after its first successful load.
  const regionCache = new Map();

  // =========================================================
  // 2. STATE
  // =========================================================

  let map = null;
  let mapReady = false;

  let activeRegionId = null;
  let activeRegionData = null;
  let activeNoteIndex = -1;

  let markers = [];
  let highlightPopup = null;

  let hoveredFeatureId = null;
  let lastSelectedFeature = null;
  let requestVersion = 0;

  const layerState = {
    borders: true,
    rivers: false,
    mountains: false,
    plains: false,
    deserts: false,
    regions: true,

    terrain: true,
    countries: true,
    autonomous: true,
    strategic: true
  };

  // Remember the original basemap visibility so toggling a layer
  // off and on does not permanently hide it.
  const originalLayerVisibility = new Map();

  // =========================================================
  // 3. BASIC HELPERS
  // =========================================================

  function setText(selector, value) {
    const element = $(selector);

    if (element && value !== undefined && value !== null) {
      element.textContent = String(value);
    }
  }

  function setLoading(isLoading) {
    const loading = $("#geo-map-loading");

    if (!loading) return;

    loading.hidden = !isLoading;
    loading.setAttribute("aria-hidden", String(!isLoading));
  }

  function showMapError(message) {
    const loading = $("#geo-map-loading");

    if (!loading) return;

    loading.hidden = false;
    loading.setAttribute("aria-hidden", "false");

    const text = loading.querySelector(".geo-map-loading__text");

    if (text) {
      text.textContent = message;
    } else {
      loading.textContent = message;
    }
  }

  function clearMapError() {
    setLoading(false);
  }

  function updateMapHeading(data) {
    setText("#geo-map-title", data.name);
    setText("#geo-map-subtitle", data.subtitle);
    setText("#geo-map-region-label", data.label);
    setText("#geo-map-caption", data.caption);
  }

  function formatCoordinates(coordinates) {
    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      return "—";
    }

    const [longitude, latitude] = coordinates;

    return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
  }

  // =========================================================
  // 4. LAZY LOAD JSON
  // =========================================================

  async function loadRegionData(regionId) {
    if (regionCache.has(regionId)) {
      return regionCache.get(regionId);
    }

    const filename = REGION_FILES[regionId];

    if (!filename) {
      throw new Error(`Không tìm thấy dữ liệu: ${regionId}`);
    }

    const url = new URL(filename, DATA_BASE_URL).href;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(
        `Không thể tải ${filename}: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data.notes)) {
      throw new Error(`${filename} không có mảng notes hợp lệ.`);
    }

    if (
      !data.highlights ||
      data.highlights.type !== "FeatureCollection" ||
      !Array.isArray(data.highlights.features)
    ) {
      data.highlights = {
        type: "FeatureCollection",
        features: []
      };
    }

    // Keep only features with supported categories.
    data.highlights.features = data.highlights.features.filter(
      (feature) => {
        const category = feature?.properties?.category;

        return HIGHLIGHT_CATEGORIES.includes(category);
      }
    );

    regionCache.set(regionId, data);

    return data;
  }

  // =========================================================
  // 5. REGION NAVIGATION
  // =========================================================

  function updateActiveRegionButton() {
    $$(".geo-region[data-region]").forEach((button) => {
      const active = button.dataset.region === activeRegionId;

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  async function changeRegion(regionId) {
    if (!REGION_FILES[regionId]) return;

    const version = ++requestVersion;

    activeRegionId = regionId;
    activeNoteIndex = -1;
    lastSelectedFeature = null;

    updateActiveRegionButton();
    setLoading(true);

    try {
      const data = await loadRegionData(regionId);

      // Ignore responses from older region selections.
      if (
        version !== requestVersion ||
        regionId !== activeRegionId
      ) {
        return;
      }

      activeRegionData = data;

      updateMapHeading(data);
      renderNotes(data.notes);
      updatePlaceCard(null, null, null);

      if (!mapReady) {
        return;
      }

      clearMarkers();
      updateHighlights(data.highlights);

      map.flyTo({
        center: data.center,
        zoom: data.zoom,
        pitch: 0,
        bearing: 0,
        speed: 0.8,
        curve: 1.35,
        essential: true
      });

      createMarkers(data.notes);
      applyLayerState();

      if (data.notes.length > 0) {
        selectNote(0, false);
      }

      clearMapError();
    } catch (error) {
      console.error("Lỗi tải dữ liệu khu vực:", error);

      if (
        version === requestVersion &&
        regionId === activeRegionId
      ) {
        showMapError(
          "Không thể tải dữ liệu. Hãy kiểm tra đường dẫn JSON."
        );
      }
    } finally {
      if (
        version === requestVersion &&
        regionId === activeRegionId
      ) {
        setLoading(false);
      }
    }
  }

  function resetMap() {
    if (!mapReady || !activeRegionData) return;

    map.flyTo({
      center: activeRegionData.center,
      zoom: activeRegionData.zoom,
      pitch: 0,
      bearing: 0,
      speed: 0.8,
      essential: true
    });

    if (highlightPopup) {
      highlightPopup.remove();
    }

    if (activeRegionData.notes.length > 0) {
      selectNote(0, false);
    }
  }

  // =========================================================
  // 6. NOTES LIST
  // =========================================================

  function renderNotes(notes = []) {
    const container = $("#geo-notes");

    if (!container) return;

    container.replaceChildren();

    notes.forEach((note, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "geo-note";
      button.dataset.noteIndex = String(index);

      const number = document.createElement("span");
      number.className = "geo-note__number";
      number.textContent = String(index + 1).padStart(2, "0");

      const title = document.createElement("span");
      title.className = "geo-note__title";
      title.textContent = note.title || `Địa điểm ${index + 1}`;

      const arrow = document.createElement("span");
      arrow.className = "geo-note__arrow";
      arrow.textContent = "↗";

      button.append(number, title, arrow);

      button.addEventListener("click", () => {
        selectNote(index, true);
      });

      container.appendChild(button);
    });

    setText("#geo-notes-count", String(notes.length).padStart(2, "0"));
  }

  function updateActiveNoteButton() {
    $$("#geo-notes [data-note-index]").forEach((button) => {
      const active =
        Number(button.dataset.noteIndex) === activeNoteIndex;

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function updatePlaceCard(title, description, index, coordinates) {
    const card = $("#geo-note-detail");

    if (!card) return;

    const numberElement = card.querySelector(
      ".geo-place-card__index strong"
    );

    const titleElement = card.querySelector(
      ".geo-place-card__body h3"
    );

    const descriptionElement = card.querySelector(
      ".geo-place-card__body p"
    );

    if (numberElement) {
      numberElement.textContent =
        index === null || index === undefined
          ? "—"
          : String(index + 1).padStart(2, "0");
    }

    if (titleElement) {
      titleElement.textContent =
        title || "Chọn một địa điểm trên bản đồ";
    }

    if (descriptionElement) {
      descriptionElement.textContent =
        description ||
        "Chọn một địa điểm đáng chú ý hoặc nhấp vào vùng được đánh dấu để xem nội dung chi tiết.";
    }

    setText("#geo-map-coordinate", formatCoordinates(coordinates));
  }

  function selectNote(index, flyTo = false) {
    if (!activeRegionData || !mapReady) return;

    const note = activeRegionData.notes[index];

    if (!note) return;

    activeNoteIndex = index;
    lastSelectedFeature = null;

    updateActiveNoteButton();

    updatePlaceCard(
      note.title,
      note.description,
      index,
      note.location
    );

    const markerEntry = markers[index];

    if (markerEntry) {
      markerEntry.popup.setLngLat(note.location);

      if (flyTo) {
        map.flyTo({
          center: note.location,
          zoom: Math.max(map.getZoom(), 5),
          speed: 0.8,
          curve: 1.35,
          essential: true
        });

        markerEntry.popup.addTo(map);
      }
    } else if (flyTo) {
      map.flyTo({
        center: note.location,
        zoom: Math.max(map.getZoom(), 5),
        essential: true
      });
    }
  }

  // =========================================================
  // 7. MARKERS
  // =========================================================

  function clearMarkers() {
    markers.forEach(({ marker, popup }) => {
      popup?.remove();
      marker?.remove();
    });

    markers = [];
  }

  function createMarkers(notes = []) {
    if (!mapReady || !window.maplibregl) return;

    clearMarkers();

    notes.forEach((note, index) => {
      if (
        !Array.isArray(note.location) ||
        note.location.length < 2
      ) {
        return;
      }

      const element = document.createElement("button");

      element.type = "button";
      element.className = "geo-marker";
      element.setAttribute(
        "aria-label",
        note.title || `Địa điểm ${index + 1}`
      );

      const number = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0");

      element.appendChild(number);

      const popupContent = document.createElement("div");
      popupContent.className = "geo-marker-popup";

      const popupTitle = document.createElement("strong");
      popupTitle.textContent = note.title || "";

      const popupDescription = document.createElement("p");
      popupDescription.textContent = note.description || "";

      popupContent.append(popupTitle, popupDescription);

      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 18,
        maxWidth: "280px"
      }).setDOMContent(popupContent);

      const marker = new maplibregl.Marker({
        element,
        anchor: "bottom"
      })
        .setLngLat(note.location)
        .setPopup(popup)
        .addTo(map);

      element.addEventListener("click", () => {
        selectNote(index, false);
      });

      markers.push({
        marker,
        popup,
        element
      });
    });

    applyLayerState();
  }

  // =========================================================
  // 8. GEOJSON POLYGON LAYERS
  // =========================================================

  function getFirstSymbolLayerId() {
    const layers = map.getStyle()?.layers || [];
    const symbolLayer = layers.find((layer) => layer.type === "symbol");

    return symbolLayer?.id;
  }

  function addHighlightLayers() {
    if (!mapReady) return;

    if (!map.getSource(HIGHLIGHT_SOURCE_ID)) {
      map.addSource(HIGHLIGHT_SOURCE_ID, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        },
        promoteId: "id"
      });
    }

    const beforeId = getFirstSymbolLayerId();

    HIGHLIGHT_CATEGORIES.forEach((category) => {
      const fillId = `geo-fill-${category}`;
      const outlineId = `geo-outline-${category}`;
      const color = CATEGORY_CONFIG[category].color;

      if (!map.getLayer(fillId)) {
        const fillLayer = {
          id: fillId,
          type: "fill",
          source: HIGHLIGHT_SOURCE_ID,
          filter: ["==", ["get", "category"], category],
          paint: {
            "fill-color": [
              "coalesce",
              ["get", "color"],
              color
            ],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.42,
              0.18
            ]
          }
        };

        if (beforeId) {
          map.addLayer(fillLayer, beforeId);
        } else {
          map.addLayer(fillLayer);
        }
      }

      if (!map.getLayer(outlineId)) {
        const outlineLayer = {
          id: outlineId,
          type: "line",
          source: HIGHLIGHT_SOURCE_ID,
          filter: ["==", ["get", "category"], category],
          paint: {
            "line-color": [
              "coalesce",
              ["get", "color"],
              color
            ],
            "line-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              3,
              1.3
            ],
            "line-opacity": 0.95
          }
        };

        if (beforeId) {
          map.addLayer(outlineLayer, beforeId);
        } else {
          map.addLayer(outlineLayer);
        }
      }
    });

    setupHighlightInteractions();
    applyLayerState();
  }

  function updateHighlights(featureCollection) {
    if (!mapReady) return;

    const source = map.getSource(HIGHLIGHT_SOURCE_ID);

    if (!source) return;

    clearHoveredFeature();
    highlightPopup?.remove();

    source.setData(
      featureCollection || {
        type: "FeatureCollection",
        features: []
      }
    );

    applyLayerState();
  }

  // =========================================================
  // 9. POLYGON TOOLTIP AND CLICK
  // =========================================================

  function getFeatureTitle(feature) {
    return (
      feature?.properties?.name ||
      feature?.properties?.title ||
      "Khu vực địa lý"
    );
  }

  function getFeatureDescription(feature) {
    return (
      feature?.properties?.description ||
      feature?.properties?.summary ||
      ""
    );
  }

  function getFeatureCategory(feature) {
    return feature?.properties?.category || "";
  }

  function createPolygonPopupContent(feature) {
    const wrapper = document.createElement("div");
    wrapper.className = "geo-highlight-popup";

    const category = document.createElement("span");
    category.className = "geo-highlight-popup__category";
    category.textContent =
      CATEGORY_CONFIG[getFeatureCategory(feature)]?.label ||
      "Khu vực địa lý";

    const title = document.createElement("strong");
    title.className = "geo-highlight-popup__title";
    title.textContent = getFeatureTitle(feature);

    const description = document.createElement("p");
    description.className = "geo-highlight-popup__description";
    description.textContent = getFeatureDescription(feature);

    wrapper.append(category, title);

    if (description.textContent) {
      wrapper.appendChild(description);
    }

    return wrapper;
  }

  function setHoveredFeature(feature) {
    if (feature?.id === undefined || feature?.id === null) return;

    const nextId = feature.id;

    if (
      hoveredFeatureId !== null &&
      hoveredFeatureId !== nextId
    ) {
      clearHoveredFeature();
    }

    hoveredFeatureId = nextId;

    try {
      map.setFeatureState(
        {
          source: HIGHLIGHT_SOURCE_ID,
          id: nextId
        },
        {
          hover: true
        }
      );
    } catch (error) {
      // Ignore transient errors while the GeoJSON source is changing.
    }
  }

  function clearHoveredFeature() {
    if (hoveredFeatureId === null || !mapReady) return;

    try {
      map.setFeatureState(
        {
          source: HIGHLIGHT_SOURCE_ID,
          id: hoveredFeatureId
        },
        {
          hover: false
        }
      );
    } catch (error) {
      // The previous source may already have been replaced.
    }

    hoveredFeatureId = null;
  }

  function setupHighlightInteractions() {
    if (!highlightPopup) {
      highlightPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        maxWidth: "290px"
      });
    }

    HIGHLIGHT_CATEGORIES.forEach((category) => {
      const fillId = `geo-fill-${category}`;

      if (!map.getLayer(fillId)) return;

      map.on("mousemove", fillId, (event) => {
        const feature = event.features?.[0];

        if (!feature) return;

        map.getCanvas().style.cursor = "pointer";

        setHoveredFeature(feature);

        highlightPopup
          .setLngLat(event.lngLat)
          .setDOMContent(createPolygonPopupContent(feature))
          .addTo(map);
      });

      map.on("mouseleave", fillId, () => {
        map.getCanvas().style.cursor = "";

        clearHoveredFeature();
        highlightPopup?.remove();
      });

      map.on("click", fillId, (event) => {
        const feature = event.features?.[0];

        if (!feature) return;

        lastSelectedFeature = feature;
        activeNoteIndex = -1;

        updateActiveNoteButton();

        updatePlaceCard(
          getFeatureTitle(feature),
          getFeatureDescription(feature),
          null,
          event.lngLat
            ? [event.lngLat.lng, event.lngLat.lat]
            : null
        );

        highlightPopup
          .setLngLat(event.lngLat)
          .setDOMContent(createPolygonPopupContent(feature))
          .addTo(map);
      });
    });
  }

  // =========================================================
  // 10. LAYER VISIBILITY
  // =========================================================

  function setLayerVisibility(layerId, visible) {
    if (!mapReady || !map.getLayer(layerId)) return;

    map.setLayoutProperty(
      layerId,
      "visibility",
      visible ? "visible" : "none"
    );
  }

  function setHighlightCategoryVisibility(category, visible) {
    setLayerVisibility(`geo-fill-${category}`, visible);
    setLayerVisibility(`geo-outline-${category}`, visible);
  }

  function rememberOriginalVisibility(layer) {
    if (originalLayerVisibility.has(layer.id)) return;

    const visibility =
      layer.layout?.visibility || "visible";

    originalLayerVisibility.set(layer.id, visibility);
  }

  function matchesBasemapLayer(layer, type) {
    const id = layer.id.toLowerCase();
    const sourceLayer = String(
      layer["source-layer"] || ""
    ).toLowerCase();

    switch (type) {
      case "borders":
        return (
          /boundary|admin.*(country|boundary)|country.*(border|boundary)/.test(id) ||
          /boundary|admin/.test(sourceLayer)
        );

      case "rivers":
        return (
          /river|waterway/.test(id) ||
          /river|waterway/.test(sourceLayer)
        );

      case "mountains":
        return /hillshade|mountain|peak/.test(id);

      case "plains":
        return /plain/.test(id);

      case "deserts":
        return /desert/.test(id);

      default:
        return false;
    }
  }

  function applyLayerState() {
    if (!mapReady) return;

    // Highlight polygon categories.
    HIGHLIGHT_CATEGORIES.forEach((category) => {
      setHighlightCategoryVisibility(
        category,
        Boolean(layerState[category])
      );
    });

    // Original basemap controls.
    const layers = map.getStyle()?.layers || [];

    layers.forEach((layer) => {
      if (
        layer.id.startsWith("geo-fill-") ||
        layer.id.startsWith("geo-outline-")
      ) {
        return;
      }

      const matchedType = [
        "borders",
        "rivers",
        "mountains",
        "plains",
        "deserts"
      ].find((type) => matchesBasemapLayer(layer, type));

      if (!matchedType) return;

      rememberOriginalVisibility(layer);

      const original = originalLayerVisibility.get(layer.id);

      const visible = layerState[matchedType]
        ? original !== "none"
        : false;

      setLayerVisibility(layer.id, visible);
    });

    // Show/hide the study markers.
    markers.forEach(({ marker, element }) => {
      const visible = Boolean(layerState.regions);

      if (element) {
        element.style.display = visible ? "" : "none";
      }

      if (marker?.getElement()) {
        marker.getElement().style.pointerEvents =
          visible ? "auto" : "none";
      }
    });
  }

  function bindLayerControls() {
    $$("[data-layer]").forEach((checkbox) => {
      const rawKey = checkbox.dataset.layer;

      // Map the HTML names to internal polygon category keys.
      const aliases = {
        "highlight-terrain": "terrain",
        "highlight-countries": "countries",
        "highlight-autonomous": "autonomous",
        "highlight-strategic": "strategic"
      };

      const key = aliases[rawKey] || rawKey;

      if (!(key in layerState)) return;

      layerState[key] = checkbox.checked;

      checkbox.addEventListener("change", () => {
        layerState[key] = checkbox.checked;
        applyLayerState();
      });
    });
  }

  // =========================================================
  // 11. MAP LABELS
  // =========================================================

  function simplifyMapLabels() {
    if (!mapReady) return;

    const layers = map.getStyle()?.layers || [];

    layers.forEach((layer) => {
      if (layer.type !== "symbol") return;

      const id = layer.id.toLowerCase();

      if (
        /poi|shop|restaurant|housenumber|address|transit-stop/.test(id)
      ) {
        setLayerVisibility(layer.id, false);
      }
    });
  }

  // =========================================================
  // 12. CONTROLS
  // =========================================================

  function bindControls() {
    $$(".geo-region[data-region]").forEach((button) => {
      button.addEventListener("click", () => {
        changeRegion(button.dataset.region);
      });
    });

    $("#geo-reset")?.addEventListener("click", resetMap);

    $("#geo-map-reset-view")?.addEventListener(
      "click",
      resetMap
    );

    bindLayerControls();
  }

  // =========================================================
  // 13. MAP INITIALIZATION
  // =========================================================

  function initMap() {
    if (!window.maplibregl) {
      showMapError("MapLibre GL JS chưa được tải.");
      return;
    }

    const container = $("#geo-map");

    if (!container) {
      console.error("Không tìm thấy #geo-map.");
      return;
    }

    try {
      map = new maplibregl.Map({
        container,
        style: MAP_STYLE,
        center: [20, 20],
        zoom: 2,
        minZoom: 1.5,
        maxZoom: 14,
        attributionControl: true,
        renderWorldCopies: false
      });

      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: false
        }),
        "top-right"
      );

      map.addControl(
        new maplibregl.ScaleControl({
          maxWidth: 100,
          unit: "metric"
        }),
        "bottom-left"
      );

      map.on("load", async () => {
        mapReady = true;

        addHighlightLayers();
        simplifyMapLabels();

        try {
          // If the initial JSON finished loading before the map,
          // reuse it from cache.
          const regionId = activeRegionId || "russia";
          const data = await loadRegionData(regionId);

          if (regionId !== activeRegionId) return;

          activeRegionData = data;

          updateMapHeading(data);
          renderNotes(data.notes);
          updateHighlights(data.highlights);
          createMarkers(data.notes);
          applyLayerState();

          map.jumpTo({
            center: data.center,
            zoom: data.zoom
          });

          if (data.notes.length > 0) {
            selectNote(0, false);
          }

          clearMapError();

          requestAnimationFrame(() => map.resize());
        } catch (error) {
          console.error(error);
          showMapError("Không thể tải dữ liệu khu vực.");
        } finally {
          setLoading(false);
        }
      });

      map.on("error", (event) => {
        console.warn("MapLibre:", event.error || event);
      });

      window.addEventListener("resize", () => {
        if (mapReady && map) map.resize();
      });

      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => {
          if (mapReady && map) map.resize();
        });

        observer.observe(container);
      }
    } catch (error) {
      console.error("Không thể khởi tạo MapLibre:", error);
      showMapError("Không thể khởi tạo bản đồ.");
    }
  }

  // =========================================================
  // 14. LOAD MAPLIBRE
  // =========================================================

  function loadMapLibre() {
    if (window.maplibregl) {
      initMap();
      return;
    }

    const cssURL =
      "https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css";

    const jsURL =
      "https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.js";

    if (!document.querySelector('link[data-geo-maplibre-css]')) {
      const css = document.createElement("link");

      css.rel = "stylesheet";
      css.href = cssURL;
      css.dataset.geoMaplibreCss = "true";

      document.head.appendChild(css);
    }

    const existingScript = document.querySelector(
      'script[data-geo-maplibre-js]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", initMap, {
        once: true
      });

      existingScript.addEventListener(
        "error",
        () => showMapError("Không tải được thư viện MapLibre."),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.src = jsURL;
    script.async = true;
    script.dataset.geoMaplibreJs = "true";

    script.onload = initMap;

    script.onerror = () => {
      showMapError("Không tải được thư viện MapLibre.");
    };

    document.head.appendChild(script);
  }

  // =========================================================
  // 15. START
  // =========================================================

  bindControls();

  const initialRegion =
    $(".geo-region[data-region]")?.dataset.region || "russia";

  changeRegion(initialRegion);
  loadMapLibre();
})();