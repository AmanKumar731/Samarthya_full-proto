// ============================================
// Samarthya — Geo-Spatial Channel Partner Locator
// Targeting SIH26093: Nearest Capable Channel Partner Map & Discovery
// ============================================

const PartnerLocator = {
  googleMapsApiKey: window.GOOGLE_MAPS_API_KEY || 'AIzaSyCAr8uQ9RT2zy_e5M0xaY-sckO9xd4ZrEk',
  map: null,
  markersGroup: null,
  userLocation: { lat: 28.6139, lng: 77.2090, label: 'New Delhi (Default)' }, // Default Center: New Delhi
  selectedSchemeFilter: 'all',
  selectedTypeFilter: 'all',
  includeHighNpa: false,
  userPincode: '',

  // Built-in Geocoding Index for common Indian postal regions & cities
  pincodeCoordinates: {
    // Delhi NCR
    '110001': { lat: 28.6289, lng: 77.2144, label: 'Connaught Place, New Delhi' },
    '110066': { lat: 28.5683, lng: 77.1868, label: 'Bhikaji Cama Place, New Delhi' },
    '110089': { lat: 28.7186, lng: 77.1089, label: 'Rohini, North West Delhi' },
    // Uttar Pradesh
    '226001': { lat: 26.8488, lng: 80.9458, label: 'Hazratganj, Lucknow' },
    '226010': { lat: 26.8536, lng: 80.9984, label: 'Gomti Nagar, Lucknow' },
    '208012': { lat: 26.4673, lng: 80.3129, label: 'Fazalganj, Kanpur' },
    '282002': { lat: 27.1983, lng: 78.0056, label: 'Sanjay Place, Agra' },
    '244001': { lat: 28.8512, lng: 78.7618, label: 'Moradabad' },
    // Maharashtra
    '400001': { lat: 18.9322, lng: 72.8347, label: 'Fort, Mumbai' },
    '400021': { lat: 18.9269, lng: 72.8223, label: 'Nariman Point, Mumbai' },
    '400051': { lat: 19.0607, lng: 72.8535, label: 'Bandra East, Mumbai' },
    '411005': { lat: 18.5314, lng: 73.8446, label: 'Shivajinagar, Pune' },
    // Karnataka
    '560001': { lat: 12.9791, lng: 77.5913, label: 'Vidhana Soudha, Bengaluru' },
    '560009': { lat: 12.9767, lng: 77.5753, label: 'Gandhi Nagar, Bengaluru' },
    '583101': { lat: 15.1394, lng: 76.9214, label: 'Bellary' },
    // Telangana
    '500001': { lat: 17.3850, lng: 78.4867, label: 'Abids, Hyderabad' },
    '500028': { lat: 17.4042, lng: 78.4485, label: 'Masab Tank, Hyderabad' },
    // Tamil Nadu
    '600001': { lat: 13.0827, lng: 80.2707, label: 'George Town, Chennai' },
    '600014': { lat: 13.0489, lng: 80.2589, label: 'Royapettah, Chennai' },
    '600018': { lat: 13.0336, lng: 80.2447, label: 'Teynampet, Chennai' },
    // Bihar
    '800001': { lat: 25.6110, lng: 85.1440, label: 'Patna GPO, Bihar' },
    '800015': { lat: 25.6093, lng: 85.1235, label: 'Bailey Road, Patna' },
    '800020': { lat: 25.5941, lng: 85.1504, label: 'Kankerbagh, Patna' },
    // West Bengal
    '700001': { lat: 22.5726, lng: 88.3512, label: 'BBD Bagh, Kolkata' },
    '700064': { lat: 22.5855, lng: 88.4116, label: 'Salt Lake, Kolkata' },
    // Gujarat
    '382010': { lat: 23.2156, lng: 72.6369, label: 'Gandhinagar, Gujarat' },
    // Rajasthan
    '302001': { lat: 26.9174, lng: 75.8115, label: 'MI Road, Jaipur' },
    '302005': { lat: 26.8978, lng: 75.7942, label: '22 Godam, Jaipur' }
  },

  init(preselectedScheme = 'all', userState = null) {
    this.selectedSchemeFilter = preselectedScheme || 'all';

    // Set initial location from state if known
    if (userState) {
      this.setUserLocationFromState(userState);
    }
  },

  setUserLocationFromState(stateKey) {
    const stateCenters = {
      'delhi': { lat: 28.6139, lng: 77.2090, label: 'Delhi' },
      'uttar_pradesh': { lat: 26.8467, lng: 80.9462, label: 'Uttar Pradesh' },
      'maharashtra': { lat: 19.0760, lng: 72.8777, label: 'Maharashtra' },
      'karnataka': { lat: 12.9716, lng: 77.5946, label: 'Karnataka' },
      'telangana': { lat: 17.3850, lng: 78.4867, label: 'Telangana' },
      'tamil_nadu': { lat: 13.0827, lng: 80.2707, label: 'Tamil Nadu' },
      'bihar': { lat: 25.5941, lng: 85.1376, label: 'Bihar' },
      'west_bengal': { lat: 22.5726, lng: 88.3639, label: 'West Bengal' },
      'gujarat': { lat: 23.2156, lng: 72.6369, label: 'Gujarat' },
      'rajasthan': { lat: 26.9124, lng: 75.7873, label: 'Rajasthan' }
    };
    if (stateCenters[stateKey]) {
      this.userLocation = stateCenters[stateKey];
    }
  },

  /**
   * Render the Map & Locator container
   */
  renderLocatorComponent() {
    return `
      <div class="locator-card" id="channelPartnerLocatorWidget">
        <div class="locator-header">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
            <div>
              <div class="calc-badge">
                <span class="pulse-dot"></span>
                <span>SIH26093 Nearest Capable Channel Partner Search</span>
              </div>
              <h3 class="locator-title">Channel Partner Geo-Spatial Directory</h3>
              <p class="locator-subtitle">
                Find active State Channelizing Agencies (SCAs), Public Sector Banks (PSBs), and RRBs with healthy fund flow and minimal NPA backlog.
              </p>
            </div>
            
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn-sm btn-secondary" onclick="PartnerLocator.requestBrowserGeolocation()" id="btnGeoLocate">
                📍 Use My GPS Location
              </button>
            </div>
          </div>

          <!-- Search & Filter Bar -->
          <div class="locator-toolbar">
            <!-- Pincode / City Search -->
            <div class="locator-search-box">
              <span>🔍</span>
              <input type="text" id="partnerPincodeInput" placeholder="Enter Pincode (e.g. 110001, 226010, 400051) or City..."
                onkeydown="if(event.key==='Enter')PartnerLocator.handleSearch()">
              <button class="btn-sm btn-primary" onclick="PartnerLocator.handleSearch()" style="padding:6px 14px">Search</button>
            </div>

            <!-- Scheme Filter -->
            <select class="form-select" id="partnerSchemeFilter" style="max-width:200px" onchange="PartnerLocator.handleSchemeFilter(this.value)">
              <option value="all">All NSFDC Schemes</option>
              <option value="micro_finance" ${this.selectedSchemeFilter === 'micro_finance' ? 'selected' : ''}>Micro Finance (≤ ₹1.4L)</option>
              <option value="term_loan" ${this.selectedSchemeFilter === 'term_loan' ? 'selected' : ''}>Term Loan (≤ ₹50L)</option>
              <option value="education_loan" ${this.selectedSchemeFilter === 'education_loan' ? 'selected' : ''}>Education Loan</option>
            </select>

            <!-- Channel Partner Type Filter -->
            <select class="form-select" id="partnerTypeFilter" style="max-width:180px" onchange="PartnerLocator.handleTypeFilter(this.value)">
              <option value="all">All Partner Types</option>
              <option value="SCA">State Channel Agency (SCA)</option>
              <option value="PSB">Public Sector Bank (PSB)</option>
              <option value="RRB">Regional Rural Bank (RRB)</option>
              <option value="NBFC-MFI">NBFC Microfinance (MFI)</option>
            </select>

            <!-- SIH26093 Nearest Capable Filter Toggle -->
            <div class="capable-toggle-wrap" title="Hides branches with high NPAs (>10%) or temporarily paused disbursal allocations">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin:0">
                <input type="checkbox" id="chkIncludeHighNpa" onchange="PartnerLocator.handleNpaToggle(this.checked)">
                <span style="font-size:12px;color:#cbd5e1">Show High-NPA / Paused Branches</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notification Banner about Nearest Capable Filter -->
        <div class="capable-filter-banner" id="capableBanner">
          <span style="font-size:16px">🛡️</span>
          <div>
            <strong>Nearest Capable Routing Active:</strong> Displaying only channel partners with active credit lines and healthy recovery ratios. High-NPA and paused branches are automatically filtered out to prevent application delays.
          </div>
        </div>

        <!-- Split Grid: Map on Left/Top, Partner Cards on Right/Bottom -->
        <div class="locator-split-grid">
          <!-- Left: Leaflet Map Canvas -->
          <div class="locator-map-container">
            <div id="partnerLeafletMap" style="width:100%;height:460px;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border)"></div>
            <div class="map-legend">
              <div class="legend-item"><span class="legend-dot green"></span> Healthy Channel Partner</div>
              <div class="legend-item"><span class="legend-dot amber"></span> High NPA (>10%)</div>
              <div class="legend-item"><span class="legend-dot red"></span> Disbursal Paused</div>
            </div>
          </div>

          <!-- Right: Sorted Partner Cards -->
          <div class="locator-list-container">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <h4 style="font-size:15px;font-weight:700;color:#fff;margin:0" id="partnerListHeading">
                Nearest Channel Partners
              </h4>
              <span style="font-size:12px;color:var(--accent-mint)" id="partnerCountBadge">
                Calculating...
              </span>
            </div>
            <div class="partner-cards-scroll" id="partnerCardsList"></div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Mount and initialize Leaflet map after DOM insertion
   */
  mountMap() {
    setTimeout(() => {
      const mapDiv = document.getElementById('partnerLeafletMap');
      if (!mapDiv) return;

      // Clean existing map instance if already initialized
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      // Check if Leaflet is loaded
      if (typeof L === 'undefined') {
        mapDiv.innerHTML = `
          <div style="display:flex;height:100%;align-items:center;justify-content:center;color:#94a3b8;flex-direction:column;gap:8px">
            <div>🗺️ Interactive Map Loading...</div>
            <div style="font-size:12px">Using OpenStreetMap Carto tiles</div>
          </div>
        `;
        return;
      }

      this.map = L.map('partnerLeafletMap').setView([this.userLocation.lat, this.userLocation.lng], 11);

      // Add CartoDB Dark Matter or OpenStreetMap tile layer (eye-soothing dark theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map);

      this.markersGroup = L.layerGroup().addTo(this.map);

      this.refreshPartners();
    }, 150);
  },

  /**
   * Haversine formula to compute distance between two coordinates in Kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  },

  /**
   * Filter, sort by distance, and refresh map markers + partner cards
   */
  refreshPartners() {
    const userLat = this.userLocation.lat;
    const userLng = this.userLocation.lng;

    // Filter database
    let filtered = CHANNEL_PARTNERS_DATABASE.map(partner => {
      const distance = this.calculateDistance(userLat, userLng, partner.lat, partner.lng);
      return { ...partner, distance };
    });

    // 1. Filter by Scheme
    if (this.selectedSchemeFilter !== 'all') {
      filtered = filtered.filter(p => p.schemesHandled.includes(this.selectedSchemeFilter));
    }

    // 2. Filter by Partner Type
    if (this.selectedTypeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === this.selectedTypeFilter);
    }

    // 3. Nearest Capable Filter (hide high-npa / unavailable unless checked)
    if (!this.includeHighNpa) {
      filtered = filtered.filter(p => p.fundHealthStatus === 'healthy');
    }

    // 4. Sort by distance ascending
    filtered.sort((a, b) => a.distance - b.distance);

    // Update partner cards list
    this.renderPartnerCards(filtered);

    // Update map markers
    this.updateMapMarkers(filtered);
  },

  updateMapMarkers(partners) {
    if (!this.map || !this.markersGroup || typeof L === 'undefined') return;

    this.markersGroup.clearLayers();

    // User Location Pin
    const userIcon = L.divIcon({
      className: 'user-pin-icon',
      html: `<div style="background:#6366f1;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 15px #6366f1"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .addTo(this.markersGroup)
      .bindPopup(`<strong>Your Location</strong><br>${this.userLocation.label}`);

    const bounds = L.latLngBounds([[this.userLocation.lat, this.userLocation.lng]]);

    partners.slice(0, 15).forEach(p => {
      const color = p.fundHealthStatus === 'healthy' ? '#10B981' : p.fundHealthStatus === 'high-npa' ? '#F59E0B' : '#EF4444';
      const icon = L.divIcon({
        className: 'partner-pin-icon',
        html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px ${color}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(this.markersGroup)
        .bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;color:#0f172a;max-width:220px">
            <strong style="font-size:13px">${p.name}</strong><br>
            <span style="color:#64748b">${p.typeLabel} • ${p.district}</span><br>
            <div style="margin:4px 0;font-weight:700;color:${color}">
              ● ${p.fundHealthStatus.toUpperCase()} (NPA: ${p.npaPercentage}%)
            </div>
            <div>Distance: <strong>${p.distance} km</strong></div>
            <div style="margin-top:6px">
              <a href="${p.portalUrl}" target="_blank" style="color:#2563eb;font-weight:700">Apply Online →</a>
            </div>
          </div>
        `);

      bounds.extend([p.lat, p.lng]);
    });

    if (partners.length > 0) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  },

  renderPartnerCards(partners) {
    const container = document.getElementById('partnerCardsList');
    const badge = document.getElementById('partnerCountBadge');
    if (!container) return;

    if (badge) {
      badge.textContent = `${partners.length} Eligible Partners Found`;
    }

    if (partners.length === 0) {
      container.innerHTML = `
        <div class="form-card" style="text-align:center;padding:30px">
          <p style="color:var(--text-muted)">No matching channel partners found for the selected criteria.</p>
          <button class="btn-sm btn-secondary" onclick="PartnerLocator.resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = partners.map(p => {
      const isHealthy = p.fundHealthStatus === 'healthy';
      const statusBadge = isHealthy
        ? `<span class="status-badge status-highly" style="font-size:11px">● Capable Channel (NPA ${p.npaPercentage}%)</span>`
        : p.fundHealthStatus === 'high-npa'
        ? `<span class="status-badge status-partial" style="font-size:11px">⚠️ High NPA (${p.npaPercentage}%)</span>`
        : `<span class="status-badge status-low" style="font-size:11px">🛑 Disbursals Paused</span>`;

      const schemePills = p.schemesHandled.map(s => {
        const label = s === 'micro_finance' ? 'Micro Finance' : s === 'term_loan' ? 'Term Loan' : 'Education Loan';
        return `<span style="font-size:10px;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;color:#94a3b8">${label}</span>`;
      }).join(' ');

      return `
        <div class="partner-card ${isHealthy ? 'partner-healthy' : 'partner-warning'}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div>
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span class="scheme-category-badge" style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3)">
                  ${p.type}
                </span>
                ${statusBadge}
              </div>
              <h4 class="partner-name">${p.name}</h4>
              <p class="partner-address">${p.address}, ${p.district}, ${p.pincode}</p>
            </div>
            <div class="partner-distance-badge">
              <strong>${p.distance} km</strong>
              <span>from you</span>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;margin:10px 0;font-size:12px;color:#cbd5e1;flex-wrap:wrap">
            <div>⏱️ Avg Disbursal: <strong>${p.avgDisbursalDays} Days</strong></div>
            <div>📞 ${p.contact.phone}</div>
            <div style="display:flex;gap:4px">${schemePills}</div>
          </div>

          <div class="partner-card-actions">
            <button class="btn-sm btn-secondary" onclick="PartnerLocator.focusMapOnPartner(${p.lat}, ${p.lng})">
              📍 View on Map
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener" class="btn-sm btn-secondary" style="text-decoration:none" title="Open Google Maps Navigation">
              🧭 Directions
            </a>
            <a href="${p.portalUrl}" target="_blank" rel="noopener" class="btn-sm btn-primary" style="text-decoration:none">
              Apply via ${p.type} Portal →
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  focusMapOnPartner(lat, lng) {
    if (this.map) {
      this.map.setView([lat, lng], 14);
      const mapEl = document.getElementById('partnerLeafletMap');
      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  async handleSearch() {
    const input = document.getElementById('partnerPincodeInput');
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();
    const queryLower = query.toLowerCase();

    // 1. Check local pre-computed pincode coordinates table
    if (this.pincodeCoordinates[queryLower]) {
      const target = this.pincodeCoordinates[queryLower];
      this.userLocation = target;
      this.refreshPartners();
      return;
    }

    // 2. Try matching city / district name in local index
    const foundPincode = Object.keys(this.pincodeCoordinates).find(p => {
      return this.pincodeCoordinates[p].label.toLowerCase().includes(queryLower);
    });

    if (foundPincode) {
      this.userLocation = this.pincodeCoordinates[foundPincode];
      this.refreshPartners();
      return;
    }

    // 3. Dynamic lookup via Google Maps Geocoding API / OSM Fallback
    const searchBtn = input.nextElementSibling;
    const origBtnText = searchBtn ? searchBtn.textContent : 'Search';
    if (searchBtn) searchBtn.textContent = '⌛ Searching...';

    try {
      // Try Google Maps Geocoding API if key configured
      if (this.googleMapsApiKey) {
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query + ', India')}&key=${this.googleMapsApiKey}`;
        const gRes = await fetch(gUrl).then(r => r.json()).catch(() => null);
        if (gRes && gRes.status === 'OK' && gRes.results && gRes.results[0]) {
          const loc = gRes.results[0].geometry.location;
          this.userLocation = {
            lat: loc.lat,
            lng: loc.lng,
            label: gRes.results[0].formatted_address || query
          };
          this.refreshPartners();
          return;
        }
      }

      // Fallback: OpenStreetMap Nominatim Geocoder (no key or billing required)
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(query)}`;
      const osmRes = await fetch(osmUrl, { headers: { 'Accept': 'application/json' } }).then(r => r.json()).catch(() => null);
      if (osmRes && osmRes.length > 0) {
        this.userLocation = {
          lat: parseFloat(osmRes[0].lat),
          lng: parseFloat(osmRes[0].lon),
          label: osmRes[0].display_name.split(',').slice(0, 3).join(',')
        };
        this.refreshPartners();
        return;
      }
    } catch (e) {
      console.warn('Geocoding lookup error:', e);
    } finally {
      if (searchBtn) searchBtn.textContent = origBtnText;
    }

    alert(`Location for "${query}" not found. Try: 110001 (Delhi), 226010 (Lucknow), 400051 (Mumbai), 560001 (Bengaluru), 500028 (Hyderabad), 600014 (Chennai).`);
  },

  requestBrowserGeolocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    const btn = document.getElementById('btnGeoLocate');
    if (btn) btn.textContent = '⌛ Fetching Location...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Your Current GPS Position'
        };
        if (btn) btn.textContent = '✓ GPS Active';
        this.refreshPartners();
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        if (btn) btn.textContent = '📍 Use My GPS Location';
        alert('Could not access current location. Using default state capital coordinate.');
      },
      { timeout: 8000 }
    );
  },

  handleSchemeFilter(scheme) {
    this.selectedSchemeFilter = scheme;
    this.refreshPartners();
  },

  handleTypeFilter(type) {
    this.selectedTypeFilter = type;
    this.refreshPartners();
  },

  handleNpaToggle(checked) {
    this.includeHighNpa = checked;
    const banner = document.getElementById('capableBanner');
    if (banner) {
      if (checked) {
        banner.style.background = 'rgba(245,158,11,0.15)';
        banner.style.borderColor = 'rgba(245,158,11,0.4)';
        banner.innerHTML = `
          <span style="font-size:16px">⚠️</span>
          <div>
            <strong>All Channel Partners Visible:</strong> You are now viewing all branches including those with high NPAs and paused allocations. Note that applications through high-NPA branches may experience extended delays.
          </div>
        `;
      } else {
        banner.style.background = 'rgba(16,185,129,0.12)';
        banner.style.borderColor = 'rgba(16,185,129,0.3)';
        banner.innerHTML = `
          <span style="font-size:16px">🛡️</span>
          <div>
            <strong>Nearest Capable Routing Active:</strong> Displaying only channel partners with active credit lines and healthy recovery ratios.
          </div>
        `;
      }
    }
    this.refreshPartners();
  },

  resetFilters() {
    this.selectedSchemeFilter = 'all';
    this.selectedTypeFilter = 'all';
    this.includeHighNpa = false;
    const sFilter = document.getElementById('partnerSchemeFilter');
    const tFilter = document.getElementById('partnerTypeFilter');
    const chk = document.getElementById('chkIncludeHighNpa');
    if (sFilter) sFilter.value = 'all';
    if (tFilter) tFilter.value = 'all';
    if (chk) chk.checked = false;
    this.refreshPartners();
  }
};

window.PartnerLocator = PartnerLocator;
