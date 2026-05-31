// منطق تطبيق Apex Motors المتكامل وتجربة المستخدم
document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // 1. إدارة الحالات وقاعدة البيانات (State Management & localStorage)
    // -------------------------------------------------------------
    let db = {
        cars: JSON.parse(localStorage.getItem("apex_cars")) || INITIAL_CARS,
        favorites: JSON.parse(localStorage.getItem("apex_favorites")) || [],
        orders: JSON.parse(localStorage.getItem("apex_orders")) || [
            {
                id: "ord-mock-1",
                carName: "Porsche 911 GT3 RS 2024",
                type: "تجربة قيادة",
                date: "2026-06-05",
                status: "مؤكد",
                details: "حجز فرع الرياض، الساعة 5:00 مساءً"
            }
        ],
        requests: JSON.parse(localStorage.getItem("apex_requests")) || [
            {
                id: "req-mock-1",
                userName: "أحمد بن عبد الله",
                type: "طلب بيع سيارة",
                details: "Lamborghini Huracan 2023 - السعر المطلوب $220,000",
                date: "2026-05-30",
                status: "قيد المراجعة",
                carData: {
                    name: "Lamborghini Huracan 2023",
                    brand: "Lamborghini",
                    model: "Huracan",
                    price: 220000,
                    year: 2023,
                    fuel: "بنزين",
                    transmission: "أوتوماتيك",
                    mileage: 8000,
                    condition: "مستعمل",
                    image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80",
                    engine: "V10 5.2L",
                    horsepower: "640 حصان",
                    topSpeed: "325 كم/س",
                    acceleration: "2.9 ثانية",
                    description: "لامبورغيني هوراكان بحالة ممتازة وخالية من الحوادث مع ضمان ممتد.",
                    features: ["دفع خلفي", "فرامل كربون", "حزمة ألياف كربونية"],
                    pros: ["صوت طربي", "تسارع خارق"],
                    cons: ["استهلاك عالي للوقود"]
                }
            }
        ],
        currentUser: JSON.parse(localStorage.getItem("apex_user")) || null
    };

    function saveState() {
        localStorage.setItem("apex_cars", JSON.stringify(db.cars));
        localStorage.setItem("apex_favorites", JSON.stringify(db.favorites));
        localStorage.setItem("apex_orders", JSON.stringify(db.orders));
        localStorage.setItem("apex_requests", JSON.stringify(db.requests));
        localStorage.setItem("apex_user", JSON.stringify(db.currentUser));
    }

    // -------------------------------------------------------------
    // 2. نظام التوجيه أحادي الصفحة (SPA Router)
    // -------------------------------------------------------------
    const pages = document.querySelectorAll(".spa-page");
    const navLinks = document.querySelectorAll(".nav-link");

    function navigateTo(pageId) {
        // إخفاء كل الصفحات وتنشيط الصفحة المطلوبة
        pages.forEach(page => {
            page.classList.remove("active");
            if (page.id === `page-${pageId}`) {
                page.classList.add("active");
            }
        });

        // تنشيط رابط التنقل المطابق
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("data-page") === pageId) {
                link.classList.add("active");
            }
        });

        // التمرير لأعلى الصفحة بسلاسة
        window.scrollTo({ top: 0, behavior: "smooth" });

        // تفعيل محدد للخرائط التفاعلية إذا انتقل لصفحة الفروع
        if (pageId === "branches") {
            initBranchesMap();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute("data-page");
            navigateTo(targetPage);
        });
    });

    document.querySelectorAll("[data-page]").forEach(el => {
        if (!el.classList.contains("nav-link")) {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                navigateTo(el.getAttribute("data-page"));
            });
        }
    });

    document.getElementById("logo-btn").addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("home");
    });

    // -------------------------------------------------------------
    // 3. نظام المستخدمين والتوثيق (Auth & Users)
    // -------------------------------------------------------------
    const authBtn = document.getElementById("auth-btn");
    const authBtnText = document.getElementById("auth-btn-text");
    const adminPanelBtn = document.getElementById("admin-panel-btn");

    function updateAuthUI() {
        if (db.currentUser) {
            authBtnText.textContent = "لوحة التحكم";
            adminPanelBtn.style.display = "inline-flex"; // إظهار لوحة الإدارة
            document.getElementById("db-user-name").textContent = db.currentUser.name;
        } else {
            authBtnText.textContent = "تسجيل الدخول";
            adminPanelBtn.style.display = "none";
        }
    }

    authBtn.addEventListener("click", () => {
        if (db.currentUser) {
            // إذا كان مسجلاً بالفعل، يدخل للوحة التحكم
            navigateTo("dashboard");
            renderDashboard();
        } else {
            // محاكاة تسجيل دخول سريع
            const email = prompt("أدخل البريد الإلكتروني للتسجيل السريع (أو موافق للمحاكاة):", "admin@apex.com");
            if (email) {
                db.currentUser = {
                    name: "عبد الرحمن الفخم",
                    email: email,
                    role: "admin"
                };
                saveState();
                updateAuthUI();
                alert(`مرحباً بك يا ${db.currentUser.name}! تم تسجيل الدخول بنجاح بنظام الصلاحيات الشامل.`);
                navigateTo("dashboard");
                renderDashboard();
            }
        }
    });

    adminPanelBtn.addEventListener("click", () => {
        navigateTo("admin");
        renderAdminPanel();
    });

    updateAuthUI();

    // -------------------------------------------------------------
    // 4. السلايدر الرئيسي والأقسام (Hero Slider)
    // -------------------------------------------------------------
    const sliderContainer = document.getElementById("hero-slider");
    let currentSlideIndex = 0;
    let slideInterval;

    function buildHeroSlider() {
        sliderContainer.innerHTML = "";
        // نأخذ أول 3 سيارات فخمة لتعرض في السلايدر
        const heroCars = db.cars.slice(0, 3);
        heroCars.forEach((car, index) => {
            const slide = document.createElement("div");
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <img class="slide-img-bg" src="${car.image}" alt="${car.name}">
                <div class="slide-content">
                    <span class="slide-tag">${car.brand} المميزة</span>
                    <h1 class="slide-title">${car.name}</h1>
                    <p class="slide-desc">${car.description}</p>
                    <div class="slide-price">$${car.price.toLocaleString()}</div>
                    <button class="btn-luxury-solid view-details-trigger" data-car-id="${car.id}">
                        <i class="fa-solid fa-compass"></i> استكشف المواصفات
                    </button>
                </div>
            `;
            sliderContainer.appendChild(slide);
        });
        
        setupSliderEvents();
    }

    function setupSliderEvents() {
        const slides = document.querySelectorAll(".slide");
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove("active"));
            currentSlideIndex = (index + slides.length) % slides.length;
            slides[currentSlideIndex].classList.add("active");
        }

        document.getElementById("slide-next").onclick = () => showSlide(currentSlideIndex - 1);
        document.getElementById("slide-prev").onclick = () => showSlide(currentSlideIndex + 1);

        // تشغيل تلقائي
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            showSlide(currentSlideIndex + 1);
        }, 6000);
    }

    // -------------------------------------------------------------
    // 5. البحث المتقدم والفلترة (Advanced Search & Catalog)
    // -------------------------------------------------------------
    const searchBrand = document.getElementById("search-brand");
    const searchYear = document.getElementById("search-year");
    const searchFuel = document.getElementById("search-fuel");
    const searchPrice = document.getElementById("search-price");

    function initSearchFilters() {
        // تعبئة ماركات السيارات المتاحة ديناميكياً
        searchBrand.innerHTML = `<option value="">كل الماركات</option>`;
        const brands = [...new Set(db.cars.map(c => c.brand))];
        brands.forEach(b => {
            searchBrand.innerHTML += `<option value="${b}">${b}</option>`;
        });
    }

    function handleAdvancedSearch() {
        const brand = searchBrand.value;
        const year = searchYear.value;
        const fuel = searchFuel.value;
        const price = searchPrice.value;

        // تطبيق الفلاتر على صالة العرض
        let filtered = db.cars;
        if (brand) filtered = filtered.filter(c => c.brand === brand);
        if (year) filtered = filtered.filter(c => c.year === parseInt(year));
        if (fuel) filtered = filtered.filter(c => c.fuel === fuel);
        if (price) filtered = filtered.filter(c => c.price <= parseInt(price));

        navigateTo("showroom");
        renderShowroom(filtered);
        
        // تعيين الفلاتر النشطة في واجهة المعرض
        document.getElementById("showroom-search-input").value = "";
    }

    document.getElementById("search-submit-btn").addEventListener("click", handleAdvancedSearch);
    document.getElementById("search-reset-btn").addEventListener("click", () => {
        searchBrand.value = "";
        searchYear.value = "";
        searchFuel.value = "";
        searchPrice.value = "";
    });

    // -------------------------------------------------------------
    // 6. عرض قائمة السيارات (Showroom Grid Rendering)
    // -------------------------------------------------------------
    
    function createCarCard(car) {
        const isFav = db.favorites.includes(car.id);
        const card = document.createElement("div");
        card.className = "car-card glass-effect";
        card.innerHTML = `
            <span class="car-badge">${car.condition}</span>
            <button class="car-fav-btn ${isFav ? 'active' : ''}" data-car-id="${car.id}">
                <i class="fa-solid fa-heart"></i>
            </button>
            <div class="car-img-wrapper">
                <img src="${car.image}" alt="${car.name}">
            </div>
            <div class="car-info">
                <div class="car-brand-year">
                    <span>${car.brand}</span>
                    <span>${car.year}</span>
                </div>
                <h4 class="car-name">${car.name}</h4>
                <div class="car-specs-grid">
                    <div class="car-spec-item">
                        <i class="fa-solid fa-gauge"></i>
                        <span>تسارع</span>
                        <strong>${car.acceleration.split(" ")[0]} ثانية</strong>
                    </div>
                    <div class="car-spec-item">
                        <i class="fa-solid fa-gas-pump"></i>
                        <span>الوقود</span>
                        <strong>${car.fuel.split(" ")[0]}</strong>
                    </div>
                    <div class="car-spec-item">
                        <i class="fa-solid fa-bolt"></i>
                        <span>القوة</span>
                        <strong>${car.horsepower.split(" ")[0]}</strong>
                    </div>
                </div>
                <div class="car-card-footer">
                    <div class="car-card-price">$${car.price.toLocaleString()}</div>
                    <button class="btn-luxury view-details-trigger" data-car-id="${car.id}">المواصفات <i class="fa-solid fa-chevron-left" style="font-size:0.7rem;"></i></button>
                </div>
            </div>
        `;
        return card;
    }

    function renderCarGrids() {
        const featuredGrid = document.getElementById("featured-cars-grid");
        const latestGrid = document.getElementById("latest-cars-grid");

        featuredGrid.innerHTML = "";
        latestGrid.innerHTML = "";

        // الأعلى سعراً كسيارات مميزة
        const sortedFeatured = [...db.cars].sort((a,b) => b.price - a.price).slice(0, 3);
        sortedFeatured.forEach(car => {
            featuredGrid.appendChild(createCarCard(car));
        });

        // البقية كأحدث السيارات المضافة
        const sortedLatest = [...db.cars].sort((a,b) => b.year - a.year);
        sortedLatest.forEach(car => {
            latestGrid.appendChild(createCarCard(car));
        });

        bindCarEvents();
    }

    function renderShowroom(carsList = db.cars) {
        const showroomGrid = document.getElementById("showroom-cars-grid");
        document.getElementById("showroom-cars-count").textContent = carsList.length;
        showroomGrid.innerHTML = "";

        if (carsList.length === 0) {
            showroomGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--color-text-silver);">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: var(--color-gold); margin-bottom: 1rem;"></i>
                    <p>عذراً، لا توجد سيارات مطابقة لبحثك في الأسطول الحالي.</p>
                </div>
            `;
            return;
        }

        carsList.forEach(car => {
            showroomGrid.appendChild(createCarCard(car));
        });

        bindCarEvents();
    }

    // ربط نقرات الأزرار للبطاقات
    function bindCarEvents() {
        document.querySelectorAll(".view-details-trigger").forEach(btn => {
            btn.onclick = () => {
                const carId = btn.getAttribute("data-car-id");
                showCarDetails(carId);
            };
        });

        document.querySelectorAll(".car-fav-btn").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const carId = btn.getAttribute("data-car-id");
                toggleFavorite(carId, btn);
            };
        });
    }

    function toggleFavorite(carId, btnElement) {
        const index = db.favorites.indexOf(carId);
        if (index > -1) {
            db.favorites.splice(index, 1);
            btnElement.classList.remove("active");
        } else {
            db.favorites.push(carId);
            btnElement.classList.add("active");
        }
        saveState();
        document.getElementById("user-favs-count").textContent = db.favorites.length;
    }

    // -------------------------------------------------------------
    // 7. صفحة تفاصيل السيارة والحاسبة المالية (Car Details Page)
    // -------------------------------------------------------------
    function showCarDetails(carId) {
        const car = db.cars.find(c => c.id === carId);
        if (!car) return;

        navigateTo("details");

        const container = document.getElementById("car-details-container");
        container.innerHTML = `
            <!-- جزء معرض الصور الفاخر -->
            <div class="details-gallery">
                <div class="main-img-wrapper">
                    <img id="details-main-img" src="${car.image}" alt="${car.name}">
                </div>
                <div class="gallery-thumbs">
                    <div class="thumb-item active" onclick="changeDetailImage('${car.image}', this)"><img src="${car.image}"></div>
                    <div class="thumb-item" onclick="changeDetailImage('https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80', this)"><img src="https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80"></div>
                    <div class="thumb-item" onclick="changeDetailImage('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', this)"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"></div>
                    <div class="thumb-item" onclick="changeDetailImage('https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80', this)"><img src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80"></div>
                    <div class="thumb-item" onclick="changeDetailImage('https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80', this)"><img src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80"></div>
                </div>
                
                <!-- فيديو للسيارة -->
                <div class="finance-calculator glass-effect" style="margin-top: 1.5rem;">
                    <h4 style="color: var(--color-gold); margin-bottom: 1rem;"><i class="fa-solid fa-circle-play"></i> استعراض الفيديو السينمائي للسيارة</h4>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 6px;">
                        <iframe style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" src="${car.video}" allowfullscreen></iframe>
                    </div>
                </div>
            </div>

            <!-- جزء التفاصيل والمواصفات والحاسبة -->
            <div class="details-content-panel">
                <div>
                    <span style="color: var(--color-gold); font-weight:700; font-size:1rem;">${car.brand} • موديل ${car.year}</span>
                    <h1 style="font-size: 2.2rem; font-weight:800; margin-top:0.3rem;">${car.name}</h1>
                    <div style="font-family: var(--font-en); font-size: 1.8rem; color: var(--color-gold); font-weight:800; margin-top:0.5rem;">
                        $${car.price.toLocaleString()}
                    </div>
                </div>

                <p style="color: var(--color-text-silver); font-size: 0.95rem; line-height:1.7;">${car.description}</p>

                <!-- المواصفات التقنية الكلية -->
                <div class="finance-calculator glass-effect">
                    <h4 style="color: var(--color-gold); margin-bottom: 1.2rem;"><i class="fa-solid fa-screwdriver-wrench"></i> المواصفات الهندسية الكاملة</h4>
                    <div class="specs-list">
                        <div class="spec-list-item">
                            <i class="fa-solid fa-microchip"></i>
                            <div>
                                <span class="spec-lbl">المحرك</span><br>
                                <strong class="spec-val">${car.engine}</strong>
                            </div>
                        </div>
                        <div class="spec-list-item">
                            <i class="fa-solid fa-bolt"></i>
                            <div>
                                <span class="spec-lbl">القوة الحصانية</span><br>
                                <strong class="spec-val">${car.horsepower}</strong>
                            </div>
                        </div>
                        <div class="spec-list-item">
                            <i class="fa-solid fa-gauge-high"></i>
                            <div>
                                <span class="spec-lbl">السرعة القصوى</span><br>
                                <strong class="spec-val">${car.topSpeed}</strong>
                            </div>
                        </div>
                        <div class="spec-list-item">
                            <i class="fa-solid fa-stopwatch"></i>
                            <div>
                                <span class="spec-lbl">التسارع 0-100</span><br>
                                <strong class="spec-val">${car.acceleration}</strong>
                            </div>
                        </div>
                        <div class="spec-list-item">
                            <i class="fa-solid fa-road"></i>
                            <div>
                                <span class="spec-lbl">ناقل الحركة</span><br>
                                <strong class="spec-val">${car.transmission}</strong>
                            </div>
                        </div>
                        <div class="spec-list-item">
                            <i class="fa-solid fa-gas-pump"></i>
                            <div>
                                <span class="spec-lbl">الوقود والمسافة</span><br>
                                <strong class="spec-val">${car.fuel} - ${car.mileage.toLocaleString()} كم</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- المزايا والعيوب الفنية -->
                <div class="pros-cons-grid">
                    <div class="pc-card glass-effect pros" style="background: rgba(0, 230, 118, 0.03); border: 1px solid rgba(0, 230, 118, 0.15);">
                        <h4><i class="fa-solid fa-circle-check"></i> المزايا والمحاسن</h4>
                        <ul>
                            ${car.pros.map(p => `<li>${p}</li>`).join("")}
                        </ul>
                    </div>
                    <div class="pc-card glass-effect cons" style="background: rgba(255, 51, 68, 0.03); border: 1px solid rgba(255, 51, 68, 0.15);">
                        <h4><i class="fa-solid fa-triangle-exclamation"></i> العيوب المحتملة</h4>
                        <ul>
                            ${car.cons.map(c => `<li>${c}</li>`).join("")}
                        </ul>
                    </div>
                </div>

                <!-- حاسبة الأقساط التفاعلية -->
                <div class="finance-calculator glass-effect">
                    <h4 style="color: var(--color-gold); margin-bottom: 1.2rem;"><i class="fa-solid fa-calculator"></i> حاسبة التمويل والأقساط الفورية</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="form-group">
                            <label>الدفعة الأولى ($)</label>
                            <input type="number" class="form-control" id="calc-downpayment" value="${Math.round(car.price * 0.2)}" min="0">
                        </div>
                        <div class="form-group">
                            <label>فترة التمويل (سنوات)</label>
                            <select class="form-control" id="calc-years">
                                <option value="3">3 سنوات</option>
                                <option value="5" selected>5 سنوات</option>
                                <option value="7">7 سنوات</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>معدل الفائدة السنوي (%)</label>
                            <input type="number" class="form-control" id="calc-interest" value="2.9" step="0.1">
                        </div>
                        <div class="form-group" style="justify-content: flex-end;">
                            <button class="btn-luxury" onclick="calculateLoan(${car.price})" style="width: 100%; height: 42px;">احسب القسط</button>
                        </div>
                    </div>
                    
                    <div class="calc-result" id="calc-loan-result">
                        <span>القسط الشهري التقريبي:</span>
                        <div class="calc-val" id="calc-monthly-val">$0</div>
                        <span style="font-size: 0.75rem; color: var(--color-text-silver);">حساب تقريبي لا يشمل رسوم التأمين.</span>
                    </div>
                </div>

                <!-- إجراءات الشراء والحجز وتجربة القيادة -->
                <div style="display: flex; gap: 1.5rem; margin-top: 1rem;">
                    <button class="btn-luxury-solid" style="flex: 1; height: 50px;" onclick="triggerPurchaseDirect('${car.id}')">
                        <i class="fa-solid fa-bag-shopping"></i> شراء مباشر / احجز الآن
                    </button>
                    <button class="btn-luxury" style="flex: 1; height: 50px;" onclick="triggerBookTestDrive('${car.id}')">
                        <i class="fa-solid fa-calendar-days"></i> احجز تجربة قيادة
                    </button>
                </div>
            </div>
        `;

        // حساب القسط تلقائياً لأول مرة
        window.calculateLoan(car.price);
    }

    // تغيير الصورة الرئيسية للمعرض
    window.changeDetailImage = function(src, element) {
        document.getElementById("details-main-img").src = src;
        document.querySelectorAll(".thumb-item").forEach(t => t.classList.remove("active"));
        element.classList.add("active");
    };

    // حساب القرض والفوائد
    window.calculateLoan = function(carPrice) {
        const downPayment = parseFloat(document.getElementById("calc-downpayment").value) || 0;
        const years = parseInt(document.getElementById("calc-years").value);
        const interestRate = parseFloat(document.getElementById("calc-interest").value) || 0;

        const principal = carPrice - downPayment;
        if (principal <= 0) {
            document.getElementById("calc-monthly-val").textContent = "$0";
            return;
        }

        const totalMonths = years * 12;
        const monthlyInterest = (interestRate / 100) / 12;

        let monthlyPayment = 0;
        if (monthlyInterest === 0) {
            monthlyPayment = principal / totalMonths;
        } else {
            monthlyPayment = (principal * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) / (Math.pow(1 + monthlyInterest, totalMonths) - 1);
        }

        document.getElementById("calc-monthly-val").textContent = `$${Math.round(monthlyPayment).toLocaleString()}`;
    };

    // -------------------------------------------------------------
    // 8. حجز تجربة قيادة والشراء والمقاصة (Purchase & Bookings)
    // -------------------------------------------------------------
    window.triggerBookTestDrive = function(carId) {
        const car = db.cars.find(c => c.id === carId);
        if (!car) return;

        const date = prompt("أدخل تاريخ الحجز المفضل (YYYY-MM-DD):", "2026-06-10");
        if (date) {
            const newOrder = {
                id: "ord-" + Date.now(),
                carName: car.name,
                type: "تجربة قيادة",
                date: date,
                status: "مؤكد",
                details: "حجز فرعي فوري مع مستشاري مبيعات Apex."
            };
            db.orders.push(newOrder);
            saveState();
            alert(`تهانينا! تم تسجيل حجز تجربة القيادة لسيارة ${car.name} في تاريخ ${date}. يمكنك المتابعة من لوحة تحكمك.`);
            navigateTo("dashboard");
            renderDashboard();
        }
    };

    // الدفع والشراء المباشر التفاعلي
    const paymentModal = document.getElementById("payment-modal");
    let activeBuyingCarId = null;

    window.triggerPurchaseDirect = function(carId) {
        const car = db.cars.find(c => c.id === carId);
        if (!car) return;

        activeBuyingCarId = carId;
        document.getElementById("payment-car-name").textContent = car.name;
        document.getElementById("payment-amount").textContent = "$5,000"; // مبلغ الحجز المسبق

        paymentModal.classList.add("active");
    };

    document.getElementById("payment-close-btn").onclick = () => {
        paymentModal.classList.remove("active");
    };

    // تبديل بوابات الدفع
    const payGateBtns = document.querySelectorAll(".pay-gate-btn");
    payGateBtns.forEach(btn => {
        btn.onclick = () => {
            payGateBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const gate = btn.getAttribute("data-gate");
            if (gate === "card") {
                document.getElementById("payment-card-fields").style.display = "block";
                document.getElementById("payment-alternative-fields").style.display = "none";
            } else {
                document.getElementById("payment-card-fields").style.display = "none";
                document.getElementById("payment-alternative-fields").style.display = "block";
                document.getElementById("alternative-payment-text").textContent = `سيتم فتح نافذة آمنة لإتمام الدفع الفوري بواسطة بوابة ${gate === 'paypal' ? 'PayPal' : 'Apple Pay'} الفاخرة المعتمدة.`;
            }
        };
    });

    // معالجة فورم الدفع
    document.getElementById("payment-form").onsubmit = (e) => {
        e.preventDefault();
        const car = db.cars.find(c => c.id === activeBuyingCarId);
        if (!car) return;

        // تأثير محاكاة الحجز
        const submitBtn = e.target.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق وتشفير البيانات...`;

        setTimeout(() => {
            const newOrder = {
                id: "ord-purchase-" + Date.now(),
                carName: car.name,
                type: "شراء وحجز مؤكد",
                date: new Date().toISOString().split("T")[0],
                status: "مدفوع (حجز)",
                details: "تم تحصيل مبلغ الحجز الافتراضي $5,000 عبر تشفير SSL الآمن. متبقي السداد عند الاستلام."
            };
            db.orders.push(newOrder);
            
            // إضافة إشعار
            db.requests.push({
                id: "req-pay-" + Date.now(),
                userName: "عبد الرحمن الفخم",
                type: "عملية دفع مؤكدة",
                details: `حجز سيارة ${car.name} - الدفع $5,000`,
                date: new Date().toISOString().split("T")[0],
                status: "مكتمل"
            });

            saveState();
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> إتمام الدفع والتأكيد الآمن`;
            paymentModal.classList.remove("active");
            
            alert(`عظيم جداً! تم تأكيد حجز شراء سيارتك الفاخرة ${car.name} وحسم العربون بنجاح. سنقوم بالاتصال بك فوراً لإكمال إجراءات النقل والشحن.`);
            navigateTo("dashboard");
            renderDashboard();
        }, 2000);
    };

    // -------------------------------------------------------------
    // 9. الذكاء الاصطناعي والمساعد (AI Chat Widget Interactions)
    // -------------------------------------------------------------
    const aiWidget = document.getElementById("ai-chat-widget");
    const aiTrigger = document.getElementById("ai-chat-trigger");
    const aiClose = document.getElementById("ai-chat-close");
    const aiInput = document.getElementById("ai-chat-input");
    const aiSendBtn = document.getElementById("ai-chat-send-btn");
    const aiMessagesContainer = document.getElementById("ai-chat-messages-container");

    const aiEngine = new ApexAI(db.cars);

    aiTrigger.onclick = () => {
        aiWidget.classList.toggle("active");
    };

    aiClose.onclick = () => {
        aiWidget.classList.remove("active");
    };

    function appendMessage(sender, text, suggestions = []) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = text;

        if (suggestions.length > 0) {
            const sugGrid = document.createElement("div");
            sugGrid.className = "ai-sug-grid";
            suggestions.forEach(car => {
                const sugCard = document.createElement("div");
                sugCard.className = "ai-sug-card";
                sugCard.innerHTML = `
                    <img src="${car.image}">
                    <div class="ai-sug-details">
                        <span class="ai-sug-name">${car.name}</span>
                        <span class="ai-sug-price">$${car.price.toLocaleString()}</span>
                    </div>
                `;
                sugCard.onclick = () => {
                    showCarDetails(car.id);
                    aiWidget.classList.remove("active");
                };
                sugGrid.appendChild(sugCard);
            });
            msgDiv.appendChild(sugGrid);
        }

        aiMessagesContainer.appendChild(msgDiv);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
    }

    function handleAISend() {
        const query = aiInput.value.trim();
        if (!query) return;

        appendMessage("user", query);
        aiInput.value = "";

        // محاكاة التفكير والكتابة بذكاء
        const typingDiv = document.createElement("div");
        typingDiv.className = "chat-msg bot";
        typingDiv.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> جاري التفكير واقتراح الأفضل...`;
        aiMessagesContainer.appendChild(typingDiv);
        aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;

        setTimeout(() => {
            aiMessagesContainer.removeChild(typingDiv);
            const response = aiEngine.processMessage(query);
            appendMessage("bot", response.reply, response.suggestedCars);
        }, 1200);
    }

    aiSendBtn.onclick = handleAISend;
    aiInput.onkeypress = (e) => {
        if (e.key === "Enter") handleAISend();
    };

    // -------------------------------------------------------------
    // 10. المقارنة الذكية بين السيارات (Smart Comparison Logic)
    // -------------------------------------------------------------
    const compareSelect1 = document.getElementById("compare-select-1");
    const compareSelect2 = document.getElementById("compare-select-2");
    const compareGrid = document.getElementById("compare-result-grid");
    const comparePlaceholder = document.getElementById("compare-placeholder");

    function initComparisonSelects() {
        compareSelect1.innerHTML = `<option value="">-- اختر السيارة الأولى --</option>`;
        compareSelect2.innerHTML = `<option value="">-- اختر السيارة الثانية --</option>`;

        db.cars.forEach(car => {
            compareSelect1.innerHTML += `<option value="${car.id}">${car.name}</option>`;
            compareSelect2.innerHTML += `<option value="${car.id}">${car.name}</option>`;
        });
    }

    function performComparison() {
        const id1 = compareSelect1.value;
        const id2 = compareSelect2.value;

        if (!id1 || !id2) {
            compareGrid.style.display = "none";
            comparePlaceholder.style.display = "block";
            return;
        }

        const car1 = db.cars.find(c => c.id === id1);
        const car2 = db.cars.find(c => c.id === id2);

        if (!car1 || !car2) return;

        comparePlaceholder.style.display = "none";
        compareGrid.style.display = "grid";

        compareGrid.innerHTML = `
            <div class="compare-row">
                <div class="compare-cell compare-label-cell">السيارة</div>
                <div class="compare-cell compare-card-top">
                    <img src="${car1.image}">
                    <strong style="margin-top: 0.5rem;">${car1.name}</strong>
                </div>
                <div class="compare-cell compare-card-top">
                    <img src="${car2.image}">
                    <strong style="margin-top: 0.5rem;">${car2.name}</strong>
                </div>
            </div>
            
            <div class="compare-row">
                <div class="compare-cell compare-label-cell">الماركة</div>
                <div class="compare-cell compare-val-cell">${car1.brand}</div>
                <div class="compare-cell compare-val-cell">${car2.brand}</div>
            </div>

            <div class="compare-row">
                <div class="compare-cell compare-label-cell">السعر المطلق</div>
                <div class="compare-cell compare-val-cell" style="color: var(--color-gold); font-weight:700;">$${car1.price.toLocaleString()}</div>
                <div class="compare-cell compare-val-cell" style="color: var(--color-gold); font-weight:700;">$${car2.price.toLocaleString()}</div>
            </div>

            <div class="compare-row">
                <div class="compare-cell compare-label-cell">المحرك</div>
                <div class="compare-cell compare-val-cell">${car1.engine}</div>
                <div class="compare-cell compare-val-cell">${car2.brand} / ${car2.engine}</div>
            </div>

            <div class="compare-row">
                <div class="compare-cell compare-label-cell">القوة الحصانية</div>
                <div class="compare-cell compare-val-cell">${car1.horsepower}</div>
                <div class="compare-cell compare-val-cell">${car2.horsepower}</div>
            </div>

            <div class="compare-row">
                <div class="compare-cell compare-label-cell">التسارع 0-100</div>
                <div class="compare-cell compare-val-cell">${car1.acceleration}</div>
                <div class="compare-cell compare-val-cell">${car2.acceleration}</div>
            </div>

            <div class="compare-row">
                <div class="compare-cell compare-label-cell">السرعة القصوى</div>
                <div class="compare-cell compare-val-cell">${car1.topSpeed}</div>
                <div class="compare-cell compare-val-cell">${car2.topSpeed}</div>
            </div>

            <div class="compare-row">
                <div class="compare-cell compare-label-cell">الوقود</div>
                <div class="compare-cell compare-val-cell">${car1.fuel}</div>
                <div class="compare-cell compare-val-cell">${car2.fuel}</div>
            </div>

            <div class="compare-row">
                <div class="compare-cell compare-label-cell">المسافة المقطوعة</div>
                <div class="compare-cell compare-val-cell">${car1.mileage.toLocaleString()} كم</div>
                <div class="compare-cell compare-val-cell">${car2.mileage.toLocaleString()} كم</div>
            </div>
            
            <div class="compare-row">
                <div class="compare-cell compare-label-cell">الإجراء</div>
                <div class="compare-cell compare-val-cell"><button class="btn-luxury-solid" onclick="showCarDetails('${car1.id}')">تفاصيل الأولى</button></div>
                <div class="compare-cell compare-val-cell"><button class="btn-luxury-solid" onclick="showCarDetails('${car2.id}')">تفاصيل الثانية</button></div>
            </div>
        `;
    }

    compareSelect1.addEventListener("change", performComparison);
    compareSelect2.addEventListener("change", performComparison);

    // -------------------------------------------------------------
    // 11. لوحة تحكم المستخدم (User Dashboard rendering)
    // -------------------------------------------------------------
    
    function renderDashboard() {
        // إدارة التبويبات للوحة تحكم العميل
        const tabs = document.querySelectorAll("#page-dashboard .sidebar-link");
        const tabContents = document.querySelectorAll("#page-dashboard .db-tab");
        
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove("active"));
                tabContents.forEach(c => c.classList.remove("active"));

                tab.classList.add("active");
                const targetTab = tab.getAttribute("data-tab");
                document.getElementById(targetTab).classList.add("active");
            };
        });

        // 1. تحديث الإحصائيات
        document.getElementById("db-stat-favs-num").textContent = db.favorites.length;
        document.getElementById("user-favs-count").textContent = db.favorites.length;
        
        const userOrders = db.orders;
        document.getElementById("db-stat-orders-num").textContent = userOrders.length;
        
        const userCars = db.cars.filter(c => c.id.startsWith("user-car-"));
        document.getElementById("db-stat-usercars-num").textContent = userCars.length;

        // 2. تعبئة المفضلة
        const favsGrid = document.getElementById("db-fav-cars-grid");
        favsGrid.innerHTML = "";
        const favoriteCars = db.cars.filter(c => db.favorites.includes(c.id));
        if (favoriteCars.length === 0) {
            favsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-silver); padding: 2rem;">لم تقم بإضافة أي سيارة للمفضلة بعد.</p>`;
        } else {
            favoriteCars.forEach(car => {
                favsGrid.appendChild(createCarCard(car));
            });
        }

        // 3. تعبئة الطلبات في الجدول
        const ordersTable = document.getElementById("db-orders-table-body");
        ordersTable.innerHTML = "";
        if (userOrders.length === 0) {
            ordersTable.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">لا يوجد طلبات مسجلة حالياً.</td></tr>`;
        } else {
            userOrders.forEach(ord => {
                ordersTable.innerHTML += `
                    <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 1rem; font-weight:700;">${ord.carName}</td>
                        <td style="padding: 1rem;">${ord.type}</td>
                        <td style="padding: 1rem; font-family: var(--font-en);">${ord.date}</td>
                        <td style="padding: 1rem;"><span style="color: ${ord.status.includes('مدفوع') ? 'var(--color-accent-green)' : 'var(--color-gold)'}; font-weight:700;">${ord.status}</span></td>
                        <td style="padding: 1rem;">${ord.details}</td>
                    </tr>
                `;
            });
        }

        // تعبئة حقول التمويل تلقائياً بأسماء السيارات
        const finSelect = document.getElementById("finance-form-car-select");
        finSelect.innerHTML = "";
        db.cars.forEach(car => {
            finSelect.innerHTML += `<option value="${car.id}">${car.name} - $${car.price.toLocaleString()}</option>`;
        });
    }

    // فورم إرسال سيارة للبيع من العميل
    document.getElementById("sell-car-form").onsubmit = (e) => {
        e.preventDefault();

        const newReq = {
            id: "req-sell-" + Date.now(),
            userName: db.currentUser?.name || "عميل زائر",
            type: "طلب بيع سيارة",
            details: `${document.getElementById("sell-brand").value} ${document.getElementById("sell-model").value} - السعر المطلوب $${parseInt(document.getElementById("sell-price").value).toLocaleString()}`,
            date: new Date().toISOString().split("T")[0],
            status: "قيد المراجعة",
            carData: {
                name: `${document.getElementById("sell-brand").value} ${document.getElementById("sell-model").value}`,
                brand: document.getElementById("sell-brand").value,
                model: document.getElementById("sell-model").value,
                price: parseInt(document.getElementById("sell-price").value),
                year: parseInt(document.getElementById("sell-year").value),
                fuel: document.getElementById("sell-fuel").value,
                transmission: document.getElementById("sell-transmission").value,
                mileage: parseInt(document.getElementById("sell-mileage").value),
                condition: document.getElementById("sell-condition").value,
                image: document.getElementById("sell-image").value || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
                engine: "V8 Supercharged",
                horsepower: "650 حصان",
                topSpeed: "300 كم/س",
                acceleration: "3.5 ثانية",
                description: document.getElementById("sell-description").value || "معروضة للبيع عبر بوابة المستخدمين المعززة بالدقة الفنية.",
                features: ["نظام أمان متكامل"],
                pros: ["استجابة سريعة"],
                cons: ["صيانة مستديمة"]
            }
        };

        db.requests.push(newReq);
        saveState();
        alert("عظيم! تم تقديم مواصفات سيارتك بنجاح. طلبك قيد المراجعة الفنية من قبل الإدارة العليا الآن وسيتم نشرها بعد الموافقة.");
        e.target.reset();
        renderDashboard();
    };

    // فورم تقديم التمويل المالي
    document.getElementById("finance-application-form").onsubmit = (e) => {
        e.preventDefault();
        alert("تم رفع المستندات الثبوتية بنجاح وتقديم طلب التمويل للبنك المختار. سيقوم مستشارو التمويل بزيارة حسابك وإصدار الموافقة خلال ساعات قليلة.");
        e.target.reset();
    };

    // -------------------------------------------------------------
    // 12. لوحة تحكم الإدارة (Admin Panel CRUD Operations)
    // -------------------------------------------------------------
    
    function renderAdminPanel() {
        // إدارة التبويبات للوحة الإدارة
        const tabs = document.querySelectorAll("#page-admin .sidebar-link");
        const tabContents = document.querySelectorAll("#page-admin .db-tab");
        
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove("active"));
                tabContents.forEach(c => c.classList.remove("active"));

                tab.classList.add("active");
                const targetTab = tab.getAttribute("data-tab");
                document.getElementById(targetTab).classList.add("active");
            };
        });

        // 1. إحصائيات عليا
        document.getElementById("admin-total-cars-lbl").textContent = db.cars.length;
        const pendingCount = db.requests.filter(r => r.status === "قيد المراجعة").length;
        document.getElementById("admin-pending-reqs-lbl").textContent = pendingCount;

        // 2. تعبئة قائمة أسطول السيارات مع خيار الحذف
        const adminCarsTable = document.getElementById("admin-cars-table-body");
        adminCarsTable.innerHTML = "";
        db.cars.forEach(car => {
            adminCarsTable.innerHTML += `
                <tr style="border-bottom: 1px solid var(--glass-border);">
                    <td style="padding: 1rem; font-weight:700;">${car.name}</td>
                    <td style="padding: 1rem;">${car.brand}</td>
                    <td style="padding: 1rem; font-family: var(--font-en);">$${car.price.toLocaleString()}</td>
                    <td style="padding: 1rem;">${car.fuel}</td>
                    <td style="padding: 1rem;"><span class="car-badge" style="position:static;">${car.condition}</span></td>
                    <td style="padding: 1rem;">
                        <button class="btn-luxury" style="padding:0.3rem 0.8rem; background:var(--color-accent-red); color:white; border-color:var(--color-accent-red);" onclick="deleteCar('${car.id}')">
                            <i class="fa-solid fa-trash-can"></i> حذف
                        </button>
                    </td>
                </tr>
            `;
        });

        // 3. تعبئة طلبات المراجعة وبيع المستخدمين
        const adminReqTable = document.getElementById("admin-requests-table-body");
        adminReqTable.innerHTML = "";
        db.requests.forEach(req => {
            const isPending = req.status === "قيد المراجعة";
            adminReqTable.innerHTML += `
                <tr style="border-bottom: 1px solid var(--glass-border);">
                    <td style="padding: 1rem; font-weight:700;">${req.userName}</td>
                    <td style="padding: 1rem;">${req.type}</td>
                    <td style="padding: 1rem;">${req.details}</td>
                    <td style="padding: 1rem; font-family: var(--font-en);">${req.date}</td>
                    <td style="padding: 1rem;">
                        ${isPending ? `
                            <button class="btn-luxury-solid" style="padding:0.3rem 0.8rem;" onclick="approveRequest('${req.id}')">موافقة ونشر</button>
                            <button class="btn-luxury" style="padding:0.3rem 0.8rem; border-color:var(--color-accent-red); color:var(--color-accent-red);" onclick="rejectRequest('${req.id}')">رفض</button>
                        ` : `<span style="color:var(--color-text-silver); font-weight:700;">${req.status}</span>`}
                    </td>
                </tr>
            `;
        });
    }

    // حذف سيارة
    window.deleteCar = function(carId) {
        if (confirm("هل أنت متأكد من رغبتك بحذف هذه السيارة من الأسطول بشكل نهائي؟")) {
            db.cars = db.cars.filter(c => c.id !== carId);
            saveState();
            renderAdminPanel();
            renderCarGrids();
            renderShowroom();
            initComparisonSelects();
        }
    };

    // الموافقة على بيع سيارة مستخدم ونشرها بالمعرض
    window.approveRequest = function(reqId) {
        const req = db.requests.find(r => r.id === reqId);
        if (!req) return;

        req.status = "تمت الموافقة والنشر";
        // إضافة السيارة الفائزة بالموافقة للأسطول الكلي للسيارات
        const newCar = {
            ...req.carData,
            id: "user-car-" + Date.now()
        };
        db.cars.push(newCar);
        saveState();
        alert(`تمت الموافقة بنجاح ونشر سيارة ${newCar.name} في صالة العرض الكلية.`);
        renderAdminPanel();
        renderCarGrids();
        renderShowroom();
        initComparisonSelects();
    };

    // رفض طلب بيع المستخدم
    window.rejectRequest = function(reqId) {
        const req = db.requests.find(r => r.id === reqId);
        if (!req) return;

        req.status = "مرفوض";
        saveState();
        alert("تم رفض الطلب وتحديث السجل الإداري بنجاح.");
        renderAdminPanel();
    };

    // إظهار وإخفاء نموذج إضافة سيارة
    const addCarTrigger = document.getElementById("admin-add-car-trigger");
    const addCarContainer = document.getElementById("admin-add-car-form-container");
    const addCarCancel = document.getElementById("admin-add-car-cancel");

    addCarTrigger.onclick = () => {
        addCarContainer.style.display = "block";
    };

    addCarCancel.onclick = () => {
        addCarContainer.style.display = "none";
    };

    // إرسال كود إضافة سيارة جديدة من الإدارة
    document.getElementById("admin-add-car-form").onsubmit = (e) => {
        e.preventDefault();

        const newCar = {
            id: "admin-car-" + Date.now(),
            name: document.getElementById("adm-car-name").value,
            brand: document.getElementById("adm-car-brand").value,
            model: document.getElementById("adm-car-name").value.split(" ")[1] || "Luxury",
            price: parseInt(document.getElementById("adm-car-price").value),
            year: parseInt(document.getElementById("adm-car-year").value),
            fuel: document.getElementById("adm-car-fuel").value,
            transmission: document.getElementById("adm-car-trans").value,
            mileage: parseInt(document.getElementById("adm-car-mileage").value),
            condition: document.getElementById("adm-car-condition").value,
            image: document.getElementById("adm-car-img").value || "https://images.unsplash.com/photo-1600706432502-75a0e286b92a?auto=format&fit=crop&w=1200&q=80",
            engine: document.getElementById("adm-car-engine").value,
            horsepower: document.getElementById("adm-car-hp").value,
            topSpeed: document.getElementById("adm-car-top").value,
            acceleration: "3.0 ثانية",
            description: document.getElementById("adm-car-desc").value || "سيارة فخمة مضافة من قبل الإدارة المركزية للمعرض.",
            features: ["مواصفات خليجية", "كاملة الخصائص"],
            pros: ["أداء ممتاز وجديد"],
            cons: ["نسخة نادرة ومحدودة"]
        };

        db.cars.push(newCar);
        saveState();
        alert(`عظيم جداً! تم إضافة سيارة ${newCar.name} إلى الأسطول الفعلي بنجاح.`);
        e.target.reset();
        addCarContainer.style.display = "none";
        
        renderAdminPanel();
        renderCarGrids();
        renderShowroom();
        initComparisonSelects();
    };

    // -------------------------------------------------------------
    // 13. الفروع والخرائط التفاعلية (Interactive Leaflet Map Setup)
    // -------------------------------------------------------------
    let map = null;
    let markersGroup = null;

    function initBranchesMap() {
        // نهيئ القائمة الجانبية للفروع أولاً
        const listEl = document.getElementById("branches-list-element");
        listEl.innerHTML = "";
        
        BRANCHES.forEach((b, index) => {
            listEl.innerHTML += `
                <div class="branch-card glass-effect ${index === 0 ? 'active' : ''}" data-branch-id="${b.id}" onclick="focusBranch('${b.id}')">
                    <h4 class="branch-name">${b.name}</h4>
                    <div class="branch-info-row"><i class="fa-solid fa-map-pin"></i><span>${b.address}</span></div>
                    <div class="branch-info-row"><i class="fa-solid fa-phone"></i><span>${b.phone}</span></div>
                    <div class="branch-info-row"><i class="fa-solid fa-envelope"></i><span>${b.email}</span></div>
                    <div class="branch-info-row"><i class="fa-solid fa-clock"></i><span>${b.hours}</span></div>
                </div>
            `;
        });

        // نهيئ خريطة Leaflet
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                return;
            }

            // تعيين المركز الافتراضي على فرع دبي الرئيسي
            map = L.map('map-element', { zoomControl: false }).setView([25.1385, 55.2285], 11);
            
            // إضافة أزرار التحكم بالزوم من الأسفل للجمالية
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // استيراد طبقة الخريطة بنمط داكن (Ultra-Dark theme map layout)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            markersGroup = L.layerGroup().addTo(map);

            // إضافة نقاط الفروع
            BRANCHES.forEach(b => {
                const marker = L.marker([b.lat, b.lng]).addTo(markersGroup);
                
                // بوب أب ذهبي فاخر
                const popupContent = `
                    <div style="direction:rtl; text-align:right; font-family:'Cairo',sans-serif; color:#fff; background:#121214; padding:0.5rem; border-radius:4px;">
                        <h4 style="color:#c5a880; margin-bottom:0.3rem;">${b.name}</h4>
                        <p style="font-size:0.75rem; color:#a0a0a5; margin:0;">${b.city}</p>
                    </div>
                `;
                marker.bindPopup(popupContent);
            });
        }, 100);
    }

    // التركيز والتوجيه لفرع معين عند النقر
    window.focusBranch = function(branchId) {
        const branch = BRANCHES.find(b => b.id === branchId);
        if (!branch || !map) return;

        // تنشيط الكارت في القائمة الجانبية
        document.querySelectorAll(".branch-card").forEach(c => {
            c.classList.remove("active");
            if (c.getAttribute("data-branch-id") === branchId) {
                c.classList.add("active");
            }
        });

        // توجيه الكاميرا الجغرافية للفرع
        map.flyTo([branch.lat, branch.lng], 13, {
            animate: true,
            duration: 1.5
        });

        // فتح نافذة المعلومات
        markersGroup.eachLayer(layer => {
            const latLng = layer.getLatLng();
            if (latLng.lat === branch.lat && latLng.lng === branch.lng) {
                layer.openPopup();
            }
        });
    };

    // -------------------------------------------------------------
    // 14. المدونة والشركاء (Blog & Articles Setup)
    // -------------------------------------------------------------
    function renderBlogArticles() {
        const blogGrid = document.getElementById("blog-articles-grid");
        blogGrid.innerHTML = "";
        
        ARTICLES.forEach(art => {
            blogGrid.innerHTML += `
                <div class="blog-card glass-effect">
                    <div class="blog-img">
                        <img src="${art.image}" alt="${art.title}">
                    </div>
                    <div class="blog-info">
                        <div class="blog-meta">
                            <span>${art.category}</span>
                            <span>${art.date}</span>
                        </div>
                        <h3 class="blog-title">${art.title}</h3>
                        <p class="blog-summary">${art.summary}</p>
                        <button class="btn-luxury" style="padding:0.4rem 1rem;" onclick="readArticleFull('${art.id}')">اقرأ المزيد <i class="fa-solid fa-chevron-left"></i></button>
                    </div>
                </div>
            `;
        });
    }

    window.readArticleFull = function(artId) {
        const art = ARTICLES.find(a => a.id === artId);
        if (!art) return;

        alert(`-- ${art.title} --\n\n${art.content}`);
    };

    // -------------------------------------------------------------
    // 15. الإحصائيات والمؤثرات البصرية عند التحميل (Stat counter & triggers)
    // -------------------------------------------------------------
    function runStatCounters() {
        const counters = document.querySelectorAll(".stat-number");
        counters.forEach(counter => {
            counter.innerText = "0";
            const updateCounter = () => {
                const target = +counter.getAttribute("data-target");
                const c = +counter.innerText;
                const increment = target / 80;
                
                if (c < target) {
                    counter.innerText = `${Math.ceil(c + increment)}`;
                    setTimeout(updateCounter, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
    }

    // هيدر شفاف يتغير لونه عند السكرول لجمالية بصرية فائقة
    window.addEventListener("scroll", () => {
        const header = document.getElementById("main-header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // التحكم بالبحث في صفحة صالة العرض
    const showroomSearch = document.getElementById("showroom-search-input");
    const showroomSort = document.getElementById("showroom-sort");

    function filterShowroom() {
        const query = showroomSearch.value.toLowerCase().trim();
        const sortVal = showroomSort.value;

        let filtered = db.cars.filter(car => 
            car.name.toLowerCase().includes(query) || 
            car.brand.toLowerCase().includes(query) ||
            car.model.toLowerCase().includes(query)
        );

        if (sortVal === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortVal === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortVal === "year-desc") {
            filtered.sort((a, b) => b.year - a.year);
        }

        renderShowroom(filtered);
    }

    showroomSearch.addEventListener("input", filterShowroom);
    showroomSort.addEventListener("change", filterShowroom);

    // قائمة الاستجابة للهواتف المحمولة (Mobile Menu toggle)
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.querySelector(".nav-menu");

    mobileMenuBtn.onclick = () => {
        if (navMenu.style.display === "flex") {
            navMenu.style.display = "none";
        } else {
            navMenu.style.display = "flex";
            navMenu.style.flexDirection = "column";
            navMenu.style.position = "absolute";
            navMenu.style.top = "80px";
            navMenu.style.left = "0";
            navMenu.style.width = "100%";
            navMenu.style.background = "rgba(7,7,8,0.95)";
            navMenu.style.padding = "2rem";
            navMenu.style.borderBottom = "1px solid var(--glass-border)";
        }
    };

    // -------------------------------------------------------------
    // 16. التشغيل وتهيئة الصفحات
    // -------------------------------------------------------------
    buildHeroSlider();
    initSearchFilters();
    renderCarGrids();
    renderShowroom();
    initComparisonSelects();
    renderBlogArticles();
    runStatCounters();

    // الذهاب للصفحة الرئيسية افتراضياً
    navigateTo("home");
});
