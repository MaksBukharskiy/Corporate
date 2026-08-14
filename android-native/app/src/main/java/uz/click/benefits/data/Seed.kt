package uz.click.benefits.data

object Seed {
    val companies = listOf(
        Company("c1", "Corporate", "tenant-corporate", "Active"),
        Company("c2", "Uzum Tech", "tenant-uzum", "Pending"),
    )

    val merchants = listOf(
        Merchant("m1", "FitZone Premium", "Ташкент", Category.sport, true),
        Merchant("m2", "Osh Markazi", "Ташкент", Category.food, true),
        Merchant("m3", "IT Academy Pro", "Ташкент", Category.education, true),
        Merchant("m4", "MedPlus Clinic", "Ташкент", Category.health, false),
        Merchant("m5", "City Parking", "Ташкент", Category.transport, true),
        Merchant("m6", "Corporate", "Ташкент", Category.events, true),
    )

    val users = listOf(
        User("u1", Role.employee, "Ali Karimov", "ali@click.uz", companyId = "c1", balance = 12500, jobTitle = "Backend-разработчик"),
        User("u2", Role.merchant, "Nodira FitZone", "nodira@fitzone.uz", merchantId = "m1", onboardingDone = true, jobTitle = "Менеджер FitZone"),
        User("u3", Role.admin, "Admin Corporate", "admin@click.uz", onboardingDone = true, jobTitle = "Оператор платформы"),
    )

    val interests = listOf(
        Interest("gym", "Зал", Category.sport, listOf("зал", "абонемент", "тренир")),
        Interest("yoga", "Йога", Category.sport, listOf("йога")),
        Interest("lunch", "Обеды", Category.food, listOf("ланч", "обед", "пицца")),
        Interest("coffee", "Кофе-брейк", Category.food, listOf("кофе", "пицца")),
        Interest("courses", "Курсы", Category.education, listOf("курс", "java", "spring")),
        Interest("meetups", "Митапы", Category.education, listOf("митап", "доклад")),
        Interest("health", "Здоровье", Category.health, listOf("чекап", "здоров", "клиник")),
        Interest("parking", "Парковка", Category.transport, listOf("парков")),
        Interest("shuttle", "Трансфер", Category.transport, listOf("трансфер", "шаттл", "метро")),
        Interest("fest", "Фестивали", Category.events, listOf("fest", "фестив")),
        Interest("teambuild", "Тимбилдинг", Category.events, listOf("тимбилд", "озер", "выезд")),
        Interest("office", "Офис", Category.events, listOf("офис", "корпоратив")),
    )

    val offers = listOf(
        Offer("o1", "m1", "Абонемент в зал", "Зал, бассейн и групповые занятия на 30 дней", 3000, Category.sport, true, listOf("c1", "c2"), 12, true, "Зал", "ул. Шарафа Рашидова, 94A", "Minor", "18:30", "9.8", "1.4 км"),
        Offer("o2", "m2", "Бизнес-ланч", "Обед в кафе рядом с офисом", 1500, Category.food, true, listOf("c1"), 40, true, "Обеды", "ул. Навои, 12", "Алишер Навои", "13:00", "9.4", "0.6 км"),
        Offer("o3", "m3", "Курс Java Backend", "8 недель Java и Spring Boot", 5000, Category.education, true, listOf("c1", "c2"), 8, true, "Курсы", "IT Park, 3 этаж", "Минор", "19:00", "9.7", "3.1 км"),
        Offer("o4", "m4", "Чекап здоровья", "Полное обследование в клинике", 4000, Category.health, true, listOf("c1"), 6, true, "Здоровье", "ул. Бабура, 44", "Олмазор", "09:00", "9.5", "4.2 км"),
        Offer("o5", "m5", "Парковка у офиса", "Крытое место на месяц", 2200, Category.transport, true, listOf("c1"), 20, true, "Парковка", "Corporate, паркинг B", "Минор", "круглосуточно", "9.2", "0.2 км"),
        Offer("o6", "m1", "Персональные тренировки", "Пять занятий с тренером", 4500, Category.sport, false, listOf("c1"), 3, true, "Зал", "FitZone Premium", "Minor", "07:30", "9.9", "1.4 км"),
        Offer("o7", "m6", "Corporate Fest", "Билет на корпоративный фестиваль", 2500, Category.events, true, listOf("c1"), 18, true, "Фестивали", "Humo Arena", "Дустлик", "17:00", "9.6", "6.0 км"),
        Offer("o8", "m6", "Йога в офисе", "Утренние занятия для сотрудников Corporate", 0, Category.sport, true, listOf("c1"), 25, false, "Йога", "Corporate, 5 этаж", "Минор", "08:00", "9.3", "0.1 км"),
        Offer("o9", "m6", "Пятничная пицца", "Бесплатный ланч по пятницам в офисе", 0, Category.food, true, listOf("c1"), 50, false, "Обеды", "Corporate, кухня", "Минор", "13:30", "9.1", "0.1 км"),
        Offer("o10", "m6", "Внутренний митап", "Доклад от команды backend, кофе и нетворкинг", 0, Category.education, true, listOf("c1"), 30, false, "Митапы", "Corporate, hall", "Минор", "18:00", "9.4", "0.1 км"),
        Offer("o11", "m6", "Тимбилдинг на озере", "Выезд для сотрудников компании", 0, Category.events, true, listOf("c1"), 40, false, "Тимбилдинг", "Чарвак", "—", "08:00", "9.8", "85 км"),
        Offer("o12", "m6", "Трансфер от метро", "Корпоративный шаттл до офиса", 0, Category.transport, true, listOf("c1"), null, false, "Трансфер", "ст. метро Минор", "Минор", "08:40", "9.0", "0.3 км"),
    )

    val requests = listOf(
        BenefitRequest(
            "r1", "o1", "u1", "c1", RequestStatus.in_progress, "10 авг, 09:14", "11 авг, 10:02",
            listOf(
                HistoryEntry(RequestStatus.pending, "10 авг, 09:14", "Заявка создана"),
                HistoryEntry(RequestStatus.approved, "10 авг, 12:40", "Мерчант подтвердил услугу"),
                HistoryEntry(RequestStatus.in_progress, "11 авг, 10:02", "Абонемент активирован"),
            )
        ),
        BenefitRequest(
            "r2", "o2", "u1", "c1", RequestStatus.pending, "12 авг, 08:20", "12 авг, 08:20",
            listOf(HistoryEntry(RequestStatus.pending, "12 авг, 08:20", "Заявка создана"))
        ),
        BenefitRequest(
            "r3", "o11", "u1", "c1", RequestStatus.approved, "13 авг, 11:00", "13 авг, 14:20",
            listOf(
                HistoryEntry(RequestStatus.pending, "13 авг, 11:00", "Заявка создана"),
                HistoryEntry(RequestStatus.approved, "13 авг, 14:20", "Место забронировано, бесплатно"),
            )
        ),
    )

    val activities = listOf(
        ActivityItem("a1", ActivityKind.request, "Заявка в работе", "Абонемент в зал активирован — можно ходить в FitZone.", "Вчера, 10:02", "Вчера", true, requestId = "r1"),
        ActivityItem("a2", ActivityKind.request, "Заявка отправлена", "Бизнес-ланч ожидает подтверждения партнёра.", "Вчера, 8:20", "Вчера", true, requestId = "r2"),
        ActivityItem("a3", ActivityKind.event, "Тимбилдинг одобрен", "Место на выезд забронировано, баллы не списаны.", "Вчера, 14:20", "Вчера", false, requestId = "r3"),
        ActivityItem("a4", ActivityKind.promo, "Готовы улучшить опыт?", "13 месяцев зала по цене 12 — откройте планы в каталоге.", "12 авг, 19:30", "За 7 дней", true, offerId = "o1"),
        ActivityItem("a5", ActivityKind.offer, "Новая льгота: йога в офисе", "Бесплатные утренние занятия для сотрудников Corporate.", "12 авг, 11:00", "За 7 дней", true, offerId = "o8"),
        ActivityItem("a6", ActivityKind.event, "Corporate Fest", "Билет на корпоративный фестиваль уже в каталоге.", "11 авг, 09:00", "За 7 дней", false, offerId = "o7"),
        ActivityItem("a7", ActivityKind.offer, "Пятничная пицца", "Бесплатный ланч по пятницам — запишитесь, пока есть места.", "10 авг, 16:40", "За 7 дней", false, offerId = "o9"),
    )

    val transactions = listOf(
        Transaction("t1", TxType.topup, 800, "u1", "c1", null, "01 авг, 09:00"),
        Transaction("t2", TxType.redeem, 3000, "u1", "c1", "o1", "10 авг, 09:14"),
        Transaction("t3", TxType.redeem, 1500, "u1", "c1", "o2", "12 авг, 08:20"),
    )
}
