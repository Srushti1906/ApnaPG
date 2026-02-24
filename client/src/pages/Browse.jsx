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
    sort: '',
  });
  const [formFilters, setFormFilters] = useState({
    city: '',
    gender: '',
    budget: '',
    area: '',
    ac: '',
    sort: '',
  });

  const { page, setPage, limit, setLimit } = usePagination(1, 50);

  // Helper to filter PGs based on all filter types - MOVED TO TOP before useEffect
  const applyAllFilters = (pgs, filters) => {
    const city = (filters.city || '').toLowerCase().trim();
    const gender = (filters.gender || '').toLowerCase().trim();
    const budget = filters.budget ? parseInt(filters.budget) : null;
    const area = (filters.area || '').toLowerCase().trim();
    const ac = (filters.ac || '').toLowerCase().trim();

    console.log('🔍 Applying filters:', { city, gender, budget, area, ac, sort: filters.sort });
    console.log('📊 Input PGs count:', pgs.length);
    
    let results = pgs.filter((pg) => {
      let ok = true;
      if (city) ok = ok && (pg.address?.city || '').toLowerCase().includes(city);
      if (area) {
        const locality = (pg.address?.locality || '') + ' ' + (pg.address?.street || '') + ' ' + (pg.name || '');
        const areaMatch = locality.toLowerCase().includes(area);
        if (!areaMatch) console.log(`❌ Area filter excluded: ${pg.name}`);
        ok = ok && areaMatch;
      }
      if (gender) {
        if (gender.includes('family') || gender.includes('couple')) {
          ok = ok && /mixed|family|couple/i.test(pg.genderAllowed || '');
        } else {
          ok = ok && ((pg.genderAllowed || '').toLowerCase().includes(gender));
        }
      }
      if (budget != null) ok = ok && (pg.minPrice <= budget);
      if (ac) {
        const amenities = pg.amenities || {};
        const hasAC = amenities.ac === true;
        const acMatch = (ac === 'yes' ? hasAC : !hasAC);
        if (!acMatch) console.log(`❌ AC filter excluded: ${pg.name}, hasAC=${hasAC}, filter=${ac}`);
        ok = ok && acMatch;
      }
      return ok;
    });

    console.log('✅ Filtered results count:', results.length);

    // Apply sorting
    if (filters.sort === 'price_asc') {
      results.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
      console.log('📈 Sorted by price ascending');
    } else if (filters.sort === 'price_desc') {
      results.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
      console.log('📉 Sorted by price descending');
    }

    return results;
  };

  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true);
        // Always fetch all PGs and apply client-side filtering for consistency
        const response = await pgService.getAllPGs({ page: 1, limit: 1000 });
        const allPGs = response.data.pgs || [];
        
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

  // Listen for chatbot events to apply filters
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
    const { name, value } = e.target;
    setFormFilters({ ...formFilters, [name]: value });
  };

  const handleSearch = () => {
    // Update appliedFilters to trigger useEffect
    console.log('🔎 Search clicked with formFilters:', formFilters);
    setAppliedFilters(formFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFormFilters({ city: '', gender: '', budget: '', area: '', ac: '', sort: '' });
    setAppliedFilters({ city: '', gender: '', budget: '', area: '', ac: '', sort: '' });
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

      {/* Filters */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold mb-4">Filters</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="label">City</label>
            <input
              type="text"
              name="city"
              value={formFilters.city}
              onChange={handleFilterChange}
              placeholder="e.g., Delhi"
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
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
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
              placeholder="Enter max budget"
              min="0"
              className="input-field"
            />
          </div>

          <div>
            <label className="label">AC Rooms</label>
            <select name="ac" value={formFilters.ac} onChange={handleFilterChange} className="input-field">
              <option value="">Either</option>
              <option value="yes">AC Only</option>
              <option value="no">Non-AC Only</option>
            </select>
          </div>

          <div>
            <label className="label">Sort</label>
            <select name="sort" value={formFilters.sort} onChange={handleFilterChange} className="input-field">
              <option value="">Relevance</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button onClick={handleSearch} className="btn-primary w-full">
              Search
            </button>

            <button onClick={handleReset} className="btn-secondary w-full">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* PG Grid */}
      {pgs.length > 0 ? (
        <div className="pg-grid">
          {pgs.map((pg) => (
            <div key={pg._id} className="pg-card" onClick={() => navigate(`/pg/${pg._id}`)}>
              {/* Image Gallery - dedupe images and show up to 4 */}
              <div className="image-gallery">
                {(Array.from(new Set(pg.images || []))).slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${pg.name} - ${idx + 1}`}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'; }}
                  />
                ))}

                {((!pg.images || pg.images.length === 0) || (Array.from(new Set(pg.images || [])).length === 0)) && (
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
