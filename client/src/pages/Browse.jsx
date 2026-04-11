import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pgService } from '../services';
import { PGCard, LoadingSpinner, EmptyState, Alert } from '../components/Common';
import { usePagination } from '../hooks';

export default function Browse() {
  const navigate = useNavigate();
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // `appliedFilters` are used for fetching. `formFilters` is local input state
  // so typing doesn't trigger immediate fetches or focus loss.
  const [appliedFilters, setAppliedFilters] = useState({
    city: '',
    gender: '',
    budget: '',
    area: '',
    ac: '',
    wifi: '',
    parking: '',
    mess: '',
    dailyStay: '',
    verified: '',
    amenities: [],
    sort: '',
  });
  const [formFilters, setFormFilters] = useState({
    city: '',
    gender: '',
    budget: '',
    area: '',
    ac: '',
    wifi: '',
    parking: '',
    mess: '',
    dailyStay: '',
    verified: '',
    amenities: [],
    sort: '',
  });

  const { page, setPage, limit, setLimit } = usePagination(1, 50);

  // Helper to filter PGs based on all filter types
  const applyAllFilters = (pgs, filters) => {
    const city = (filters.city || '').toLowerCase().trim();
    const gender = (filters.gender || '').toLowerCase().trim();
    const budget = filters.budget && !isNaN(parseInt(filters.budget)) ? parseInt(filters.budget) : null;
    const area = (filters.area || '').toLowerCase().trim();
    const ac = (filters.ac || '').toLowerCase().trim();
    const wifi = (filters.wifi || '').toLowerCase().trim();
    const parking = (filters.parking || '').toLowerCase().trim();
    const mess = (filters.mess || '').toLowerCase().trim();
    const dailyStay = (filters.dailyStay || '').toLowerCase().trim();
    const verified = (filters.verified || '').toLowerCase().trim();
    const amenities = filters.amenities || [];

    console.log('🔍 Applying filters:', { city, gender, budget, area, ac, wifi, parking, mess, dailyStay, verified, amenities: amenities.length });
    
    let results = pgs.filter((pg) => {
      let ok = true;
      
      // City filter
      if (city) ok = ok && (pg.address?.city || '').toLowerCase().includes(city);
      
      // Area filter
      if (area) {
        const locality = (pg.address?.locality || '') + ' ' + (pg.address?.street || '') + ' ' + (pg.name || '');
        ok = ok && locality.toLowerCase().includes(area);
      }
      
      // Gender filter
      if (gender) {
        if (gender.includes('family') || gender.includes('couple')) {
          ok = ok && /mixed|family|couple/i.test(pg.genderAllowed || '');
        } else {
          ok = ok && (pg.genderAllowed || '').toLowerCase().includes(gender);
        }
      }
      
      // Budget filter
      if (budget != null) ok = ok && (pg.minPrice <= budget);
      
      // AC filter
      if (ac) {
        const hasAC = pg.amenities?.ac === true;
        ok = ok && (ac === 'yes' ? hasAC : !hasAC);
      }
      
      // WiFi filter
      if (wifi) {
        const hasWiFi = pg.amenities?.wifi === true;
        ok = ok && (wifi === 'yes' ? hasWiFi : !hasWiFi);
      }
      
      // Parking filter
      if (parking) {
        const hasParking = pg.amenities?.parking === true;
        ok = ok && (parking === 'yes' ? hasParking : !hasParking);
      }
      
      // Mess filter
      if (mess) {
        ok = ok && (mess === 'yes' ? pg.hasMess : !pg.hasMess);
      }
      
      // Daily/Monthly stay filter
      if (dailyStay) {
        ok = ok && (dailyStay === 'daily' ? pg.allowsDailyStay : !pg.allowsDailyStay);
      }
      
      // Verification filter
      if (verified) {
        ok = ok && (verified === 'yes' ? pg.isVerified : !pg.isVerified);
      }
      
      // Multiple amenities filter
      if (amenities.length > 0) {
        ok = ok && amenities.every(amenity => {
          if (amenity === 'ac') return pg.amenities?.ac === true;
          if (amenity === 'wifi') return pg.amenities?.wifi === true;
          if (amenity === 'attached_bath') return pg.amenities?.attachedBathroom === true;
          if (amenity === 'parking') return pg.amenities?.parking === true;
          if (amenity === 'laundry') return pg.amenities?.washingMachine === true;
          if (amenity === 'study') return pg.amenities?.studyTable === true;
          if (amenity === 'cctv') return pg.amenities?.cctv === true;
          if (amenity === 'power') return pg.amenities?.powerBackup === true;
          return true;
        });
      }
      
      return ok;
    });

    console.log('✅ Filtered results count:', results.length);

    // Apply sorting
    if (filters.sort === 'price_asc') {
      results.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
    } else if (filters.sort === 'price_desc') {
      results.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
    }

    return results;
  };

  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true);
        // Always fetch all PGs and apply client-side filtering for consistency
        const response = await pgService.getAllPGs({ page: 1, limit: 1000 });
        const allPGs = response.data.pgs || response.data || [];
        
        // Use applyAllFilters to ensure consistent filtering logic
        const filteredResults = applyAllFilters(allPGs, appliedFilters);
        setPGs(filteredResults);
      } catch (error) {
        setAlert({
          type: 'error',
          message: error.response?.data?.message || 'Failed to load PGs',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPGs();
  }, [appliedFilters]);

  // Apply filters from form state
  useEffect(() => {
    const handler = (e) => {
      const details = e.detail || {};
      // map incoming details to our filter keys (support area)
      const mapped = { ...details };
      if (details.area) mapped.area = details.area;
      setFormFilters((prev) => ({ ...prev, ...mapped }));
      setAppliedFilters((prev) => ({ ...prev, ...mapped }));
      setPage(1);
    };

    window.addEventListener('applyFilters', handler);
    return () => window.removeEventListener('applyFilters', handler);
  }, [setPage]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // For checkbox amenities
      setFormFilters(prev => {
        const amenities = prev.amenities || [];
        if (checked) {
          return { ...prev, amenities: [...amenities, name] };
        } else {
          return { ...prev, amenities: amenities.filter(a => a !== name) };
        }
      });
    } else {
      setFormFilters({ ...formFilters, [name]: value });
    }
  };

  const handleReset = () => {
    const emptyFilters = {
      city: '',
      gender: '',
      budget: '',
      area: '',
      ac: '',
      wifi: '',
      parking: '',
      mess: '',
      dailyStay: '',
      verified: '',
      amenities: [],
      sort: '',
    };
    setFormFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const handleQuickFilter = (filterName, filterValue) => {
    const quickFilters = {
      city: '',
      gender: '',
      budget: '',
      area: '',
      ac: '',
      wifi: '',
      parking: '',
      mess: '',
      dailyStay: '',
      verified: '',
      amenities: [],
      sort: '',
      ...filterValue
    };
    setFormFilters(quickFilters);
    setAppliedFilters(quickFilters);
    setPage(1);
  };

  if (loading && pgs.length === 0) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-8">Browse PGs</h1>

      {/* Quick Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => handleQuickFilter('girls', { gender: 'Girls' })} className="quick-filter-btn">👩 Girls PGs</button>
        <button onClick={() => handleQuickFilter('boys', { gender: 'Boys' })} className="quick-filter-btn">👨 Boys PGs</button>
        <button onClick={() => handleQuickFilter('couple', { gender: 'Family/Couple' })} className="quick-filter-btn">👨‍👩‍👧 Couple/Family</button>
        <button onClick={() => handleQuickFilter('budget', { budget: '5000' })} className="quick-filter-btn">💰 Under ₹5000</button>
        <button onClick={() => handleQuickFilter('wifi', { wifi: 'yes' })} className="quick-filter-btn">📶 WiFi Available</button>
        <button onClick={() => handleQuickFilter('ac', { ac: 'yes' })} className="quick-filter-btn">❄️ AC Rooms</button>
        <button onClick={() => handleQuickFilter('mess', { mess: 'yes' })} className="quick-filter-btn">🍽️ With Mess</button>
        <button onClick={() => handleQuickFilter('verified', { verified: 'yes' })} className="quick-filter-btn">✅ Verified Only</button>
      </div>

      {/* Main Filters */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Advanced Filters</h3>
          <span className="text-sm text-gray-500">{pgs.length} PGs found</span>
        </div>

        {/* Basic Filters */}
        <div className="mb-8">
          <h4 className="text-md font-semibold mb-4 text-blue-600">📍 Location & Basic Info</h4>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                name="city"
                value={formFilters.city}
                onChange={handleFilterChange}
                placeholder="e.g., Pune"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Area / Locality</label>
              <input
                type="text"
                name="area"
                value={formFilters.area}
                onChange={handleFilterChange}
                placeholder="e.g., Katraj"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Gender Policy</label>
              <select
                name="gender"
                value={formFilters.gender}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">All</option>
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
                <option value="Family/Couple">Family/Couple</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="label">Max Budget (₹)</label>
              <input
                type="number"
                name="budget"
                value={formFilters.budget}
                onChange={handleFilterChange}
                placeholder="e.g., 8000"
                min="0"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Sort By</label>
              <select name="sort" value={formFilters.sort} onChange={handleFilterChange} className="input-field">
                <option value="">Relevance</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="mb-8">
          <h4 className="text-md font-semibold mb-4 text-green-600">🏠 Amenities</h4>
          <div className="grid md:grid-cols-5 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="ac"
                checked={formFilters.amenities?.includes('ac') || formFilters.ac === 'yes'}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormFilters({ ...formFilters, ac: 'yes' });
                  } else {
                    setFormFilters({ ...formFilters, ac: '' });
                  }
                }}
                className="w-4 h-4"
              />
              <span>❄️ AC</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="wifi"
                checked={formFilters.wifi === 'yes'}
                onChange={(e) => {
                  setFormFilters({ ...formFilters, wifi: e.target.checked ? 'yes' : '' });
                }}
                className="w-4 h-4"
              />
              <span>📶 WiFi</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="parking"
                checked={formFilters.parking === 'yes'}
                onChange={(e) => {
                  setFormFilters({ ...formFilters, parking: e.target.checked ? 'yes' : '' });
                }}
                className="w-4 h-4"
              />
              <span>🚗 Parking</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="attached_bath"
                checked={formFilters.amenities?.includes('attached_bath')}
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span>🚿 Attached Bath</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="laundry"
                checked={formFilters.amenities?.includes('laundry')}
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span>🧺 Laundry</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="study"
                checked={formFilters.amenities?.includes('study')}
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span>📚 Study Table</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="cctv"
                checked={formFilters.amenities?.includes('cctv')}
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span>📹 CCTV</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="power"
                checked={formFilters.amenities?.includes('power')}
                onChange={handleFilterChange}
                className="w-4 h-4"
              />
              <span>⚡ Power Backup</span>
            </label>
          </div>
        </div>

        {/* Stay Options */}
        <div className="mb-8">
          <h4 className="text-md font-semibold mb-4 text-purple-600">🛏️ Stay Options</h4>
          <div className="grid md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="mess"
                checked={formFilters.mess === 'yes'}
                onChange={(e) => {
                  setFormFilters({ ...formFilters, mess: e.target.checked ? 'yes' : '' });
                }}
                className="w-4 h-4"
              />
              <span>🍽️ Mess Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="dailyStay"
                checked={formFilters.dailyStay === 'daily'}
                onChange={(e) => {
                  setFormFilters({ ...formFilters, dailyStay: e.target.checked ? 'daily' : '' });
                }}
                className="w-4 h-4"
              />
              <span>📅 Daily Stay Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="verified"
                checked={formFilters.verified === 'yes'}
                onChange={(e) => {
                  setFormFilters({ ...formFilters, verified: e.target.checked ? 'yes' : '' });
                }}
                className="w-4 h-4"
              />
              <span>✅ Verified PG</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={() => setAppliedFilters(formFilters)} className="btn-primary flex-1">
            🔍 Search
          </button>
          <button onClick={handleReset} className="btn-secondary flex-1">
            ↺ Clear All Filters
          </button>
        </div>
      </div>

      {/* PG Grid */}
      {pgs.length > 0 ? (
        <div className="pg-grid">
          {pgs.map((pg) => (
            <div key={pg._id} className="pg-card" onClick={() => navigate(`/pg/${pg._id}`)}>
              {/* Image Gallery - dedupe images and show up to 3 */}
              <div className="image-gallery">
                {(pg.images && pg.images.length > 0) ? (
                  Array.from(new Set(pg.images)).slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${pg.name} - ${idx + 1}`}
                      onError={(e) => { 
                        e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'; 
                      }}
                    />
                  ))
                ) : (
                  <>
                    <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" alt="Room 1" />
                    <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" alt="Hall" />
                    <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" alt="Washroom" />
                  </>
                )}
              </div>

              {/* Card Content */}
              <div className="pg-card-content">
                <h3>{pg.name}</h3>
                <p className="pg-address">
                  📍 {pg.address?.street}, {pg.address?.city}
                </p>
                
                <p className="pg-price">
                  ₹{pg.minPrice}{pg.maxPrice ? ` - ₹${pg.maxPrice}` : ''} {pg.allowsDailyStay ? ' / day' : ' / month'}
                </p>

                <p className="pg-details">
                  👥 {pg.genderAllowed} | 🏢 {pg.isVerified ? 'Verified' : 'Unverified'}
                  {pg.allowsDailyStay && ' | 📅 Daily Stay'}
                </p>

                <div className="pg-amenities-preview">
                  {pg.amenities?.ac && <span>❄️ AC</span>}
                  {pg.amenities?.wifi && <span>📶 WiFi</span>}
                  {pg.amenities?.attachedBathroom && <span>🚿 Bathroom</span>}
                  {pg.hasMess && <span>🍽️ Mess</span>}
                </div>

                <button className="btn-primary w-full" onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/pg/${pg._id}`);
                }}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No PGs Found"
          description="Try adjusting your filters"
        />
      )}
    </div>
  );
}
