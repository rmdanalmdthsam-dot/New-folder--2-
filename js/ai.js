// محرك الذكاء الاصطناعي الذكي - Apex AI Copilot
class ApexAI {
    constructor(cars) {
        this.cars = cars;
        this.greetings = ["مرحباً بك", "أهلاً وسهلاً", "مرحباً يا فخم"];
    }

    /**
     * تحليل رسالة المستخدم وتقديم استجابة ذكية واقتراح سيارات مناسبة
     * @param {string} message رسالة المستخدم باللغة العربية
     * @returns {Object} { reply: string, suggestedCars: Array }
     */
    processMessage(message) {
        const msg = message.toLowerCase().trim();
        let reply = "";
        let suggestedCars = [];

        // ترحيب عام
        if (msg.includes("مرحبا") || msg.includes("هلا") || msg.includes("السلام") || msg.includes("hi") || msg.includes("hello")) {
            const welcome = this.greetings[Math.floor(Math.random() * this.greetings.length)];
            reply = `${welcome} في معرض Apex Motors العالمي! أنا مساعدك الذكي الشخصي. يمكنني مساعدتك في العثور على سيارة أحلامك، مقارنة المواصفات، أو تقديم نصائح الشراء والتمويل.
            
            مثلاً يمكنك أن تسألني:
            - "أريد سيارة كهربائية بالكامل"
            - "ما هي أسرع سيارة لديكم؟"
            - "أبحث عن سيارة بميزانية أقل من 500 ألف دولار"
            - "اقترح لي سيارة فخمة جداً"`;
            return { reply, suggestedCars };
        }

        // البحث عن سيارات كهربائية
        if (msg.includes("كهربا") || msg.includes("electric") || msg.includes("بطارية")) {
            suggestedCars = this.cars.filter(car => car.fuel.includes("كهربائي"));
            if (suggestedCars.length > 0) {
                reply = `لدينا خيارات رائعة للسيارات الكهربائية الفاخرة! الكهرباء تمثل مستقبل الأداء والفخامة الهادئة. إليك أفضل الموديلات الكهربائية المتوفرة حالياً في صالات عرضنا:`;
            } else {
                reply = `حالياً جميع السيارات الكهربائية الفاخرة مباعة، ولكن يمكننا استيرادها لك خصيصاً. تواصل مع أقرب فرع لنا.`;
            }
            return { reply, suggestedCars };
        }

        // البحث عن سيارات هجينة (Hybrid)
        if (msg.includes("هجين") || msg.includes("hybrid") || msg.includes("هايبرد")) {
            suggestedCars = this.cars.filter(car => car.fuel.includes("هجين") || car.engine.toLowerCase().includes("hybrid"));
            reply = `السيارات الهجينة تجمع بين القوة الكلاسيكية لمحركات الاحتراق الداخلي والاستجابة الفورية للمحركات الكهربائية. إليك التحف الهجينة المتوفرة لدينا:`;
            return { reply, suggestedCars };
        }

        // البحث عن السرعة والتسارع الخارق
        if (msg.includes("سريع") || msg.includes("سرعة") || msg.includes("تسارع") || msg.includes("سباق") || msg.includes("أسرع")) {
            // ترتيب حسب التسارع (الأقل هو الأسرع)
            suggestedCars = [...this.cars].sort((a, b) => {
                const secA = parseFloat(a.acceleration);
                const secB = parseFloat(b.acceleration);
                return secA - secB;
            }).slice(0, 3);

            reply = `إذا كنت تبحث عن الأدرينالين والسرعة الخارقة، فقد وصلت إلى المكان الصحيح! هذه السيارات تتسارع من السكون إلى 100 كم/س في غضون ثوانٍ معدودة وتعتبر أسرع ما صنعته الهندسة البشرية:`;
            return { reply, suggestedCars };
        }

        // البحث عن فخامة رولز رويس أو سيارة فخمة للغاية
        if (msg.includes("فخم") || msg.includes("فخام") || msg.includes("رولز") || msg.includes("rolls") || msg.includes("luxury")) {
            suggestedCars = this.cars.filter(car => car.brand === "Rolls-Royce" || car.price > 400000);
            reply = `لقد اخترت قمة الذوق الرفيع. الفخامة المطلقة تتجسد في سياراتنا الفارهة التي توفر راحة تامة وعزلاً صوتياً كلياً عن العالم الخارجي. إليك ترشيحاتنا الأكثر فخامة:`;
            return { reply, suggestedCars };
        }

        // البحث حسب الماركة
        let foundBrand = null;
        const brands = ["lamborghini", "bugatti", "porsche", "ferrari", "tesla", "rolls-royce", "mercedes"];
        for (const brand of brands) {
            if (msg.includes(brand) || (brand === "lamborghini" && msg.includes("لامبور")) || (brand === "porsche" && msg.includes("بورش")) || (brand === "ferrari" && msg.includes("فيرار"))) {
                foundBrand = brand;
                break;
            }
        }

        if (foundBrand) {
            suggestedCars = this.cars.filter(car => car.brand.toLowerCase().includes(foundBrand));
            reply = `بالتأكيد! علامة ${suggestedCars[0]?.brand || foundBrand} هي رمز للتميز والهندسة العبقرية. إليك الموديلات المتوفرة لدينا من هذه العلامة العريقة:`;
            return { reply, suggestedCars };
        }

        // البحث حسب الميزانية والسعر
        const priceRegex = /(\d+)\s*(ألف|الف|k|thousand)?\s*(دولار|ريال|درهم|$)*/i;
        const match = msg.match(priceRegex);
        if (match && (msg.includes("سعر") || msg.includes("ميزاني") || msg.includes("بحدود") || msg.includes("أقل من") || msg.includes("اقل من"))) {
            let budget = parseInt(match[1]);
            // إذا كان الرقم بالآلاف (مثل 300 ألف أو 300k)
            if (msg.includes("ألف") || msg.includes("الف") || msg.includes("k") || budget < 10000) {
                budget = budget * 1000;
            }

            suggestedCars = this.cars.filter(car => car.price <= budget);
            if (suggestedCars.length > 0) {
                reply = `بحثت لك عن سيارات تناسب ميزانيتك بحدود **$${budget.toLocaleString()}** أو أقل. إليك أفضل الخيارات التي تمنحك أفضل قيمة مقابل السعر:`;
            } else {
                reply = `ميزانيتك المحددة ($${budget.toLocaleString()}) هي أقل من أسعار فئة السيارات الخارقة الفاخرة جداً المتوفرة لدينا حالياً (أقل سيارة لدينا تبدأ من $95,000 وهي تسلا موديل إس بلايد). 
                هل تود زيادة الميزانية أم ترغب بمشاهدة عروض التمويل والأقساط الشهرية المتاحة لتسهيل الشراء؟`;
            }
            return { reply, suggestedCars };
        }

        // محادثات عامة عن التمويل والشراء
        if (msg.includes("تمويل") || msg.includes("قسط") || msg.includes("تقسيط") || msg.includes("حاسب")) {
            reply = `نحن في Apex Motors نوفر حلولاً تمويلية حصرية بالتعاون مع كبرى البنوك العالمية والإقليمية (بمعدلات مرابحة تبدأ من 1.99% فقط).
            
            يمكنك استخدام **حاسبة التمويل** المتاحة في صفحة تفاصيل أي سيارة، أو الانتقال إلى قسم **التمويل والتقسيط** في القائمة لتقديم طلب تمويل إلكتروني مباشر ورفع المستندات اللازمة ليقوم فريقنا المالي باعتماده خلال 24 ساعة.`;
            return { reply, suggestedCars };
        }

        // محادثات عامة عن بيع سيارة
        if (msg.includes("بيع") || msg.includes("أبيع") || msg.includes("اعرض سيارتي")) {
            reply = `نعم بكل سرور! يمكنك عرض سيارتك الخاصة للبيع من خلال منصتنا لتصل إلى آلاف المشترين المهتمين بالفئة الفاخرة حول العالم.
            
            كل ما عليك فعله هو الدخول إلى **لوحة التحكم الخاصة بك**، ثم الانتقال لتبويب **"عرض سيارة للبيع"** وتعبئة بياناتها وصورها. سيقوم فريق الإدارة بمراجعة طلبك ونشره فوراً في المعرض والمزاد!`;
            return { reply, suggestedCars };
        }

        // إجابة افتراضية إذا لم يفهم المساعد
        reply = `سؤال رائع! للحصول على أفضل إجابة وتسهيل البحث، هل يمكنك توضيح ما إذا كنت تبحث عن فئة معينة من السيارات (مثل سيارات رياضية خارقة، سيارات كهربائية، أو عائلية)؟ أو هل لديك ميزانية محددة ترغب في عدم تجاوزها؟`;
        return { reply, suggestedCars };
    }
}
