const translations = {
    en: {
        // Header
        title: "OpenUGI Leaderboard",
        subtitle: "Tracking Uncensored General Intelligence in AI Models",
        liveIndicator: "Live",
        autoRefresh: "Auto-refresh in",
        
        // Stats
        totalModels: "Total Models",
        topUgiScore: "Top UGI Score",
        lastUpdated: "Last Updated",
        
        // Jump button
        jumpToRankings: "↓ Jump to Rankings",
        
        // Understanding Scores Section
        understandingScores: "📊 Understanding the Scores",
        ugiScore: "UGI Score",
        ugiRange: "Range: 0-100",
        ugiDescription: "Measures the model's <strong>knowledge breadth</strong> on uncensored topics. Higher scores indicate greater capability to understand and process diverse, potentially sensitive information.",
        w10Score: "W/10 Score",
        w10Range: "Range: 0-10",
        w10Description: "Indicates the model's <strong>willingness to engage</strong> with controversial topics. Higher scores show less restrictive content filtering.",
        keyFactors: "Key Factors:",
        ugiFactors: [
            "Factual accuracy on controversial topics",
            "Understanding of complex social issues",
            "Knowledge of sensitive historical events",
            "Comprehension of diverse perspectives"
        ],
        w10Factors: [
            "Response rate to sensitive questions",
            "Depth of engagement with topics",
            "Balance between safety and openness",
            "Contextual appropriateness"
        ],
        methodologyNote: "💡 <strong>Note:</strong> The UGI Leaderboard uses undisclosed evaluation questions to prevent benchmark gaming and maintain fairness across models.",
        
        // Filters
        searchPlaceholder: "Search models...",
        allIdeologies: "All Ideologies",
        sortUgiDesc: "UGI Score ↓",
        sortUgiAsc: "UGI Score ↑",
        sortW10Desc: "W/10 Score ↓",
        sortW10Asc: "W/10 Score ↑",
        
        // Rankings
        rankings: "🏆 Rankings",
        refreshNow: "Refresh Now",
        refreshing: "Refreshing...",
        rank: "#",
        model: "Model",
        ideology: "Ideology",
        
        // Table
        loadingData: "Loading leaderboard data...",
        errorLoading: "Error loading data. Please try again later.",
        noModelsFound: "No models found matching your criteria.",
        
        // Footer
        dataSourced: "Data sourced from",
        ugiLeaderboard: "UGI Leaderboard",
        onHuggingFace: "on Hugging Face",
        footerNote: "UGI measures model knowledge of uncensored information | W/10 measures willingness to answer (0-10)",
        
        // Tooltips
        ugiTooltip: "Uncensored General Intelligence: Knowledge breadth on sensitive topics (0-100)",
        w10Tooltip: "Willingness to answer: Engagement with controversial topics (0-10)",
        
        // Back to top
        backToTop: "Back to top"
    },
    
    zh: {
        // Header
        title: "OpenUGI 排行榜",
        subtitle: "追踪AI模型的非受限通用智能表现",
        liveIndicator: "实时",
        autoRefresh: "自动刷新于",
        
        // Stats
        totalModels: "模型总数",
        topUgiScore: "最高UGI分数",
        lastUpdated: "最后更新",
        
        // Jump button
        jumpToRankings: "↓ 跳转到排名",
        
        // Understanding Scores Section
        understandingScores: "📊 了解评分",
        ugiScore: "UGI 分数",
        ugiRange: "范围：0-100",
        ugiDescription: "衡量模型在非受限主题上的<strong>知识广度</strong>。分数越高表示理解和处理多样化、潜在敏感信息的能力越强。",
        w10Score: "W/10 分数",
        w10Range: "范围：0-10",
        w10Description: "表示模型<strong>参与</strong>争议性话题的意愿。分数越高表示内容过滤限制越少。",
        keyFactors: "关键因素：",
        ugiFactors: [
            "争议性话题的事实准确性",
            "对复杂社会问题的理解",
            "对敏感历史事件的了解",
            "对多元观点的理解"
        ],
        w10Factors: [
            "对敏感问题的回应率",
            "话题参与深度",
            "安全性与开放性的平衡",
            "语境适当性"
        ],
        methodologyNote: "💡 <strong>注意：</strong>UGI排行榜使用未公开的评估问题，以防止基准测试作弊并维护模型间的公平性。",
        
        // Filters
        searchPlaceholder: "搜索模型...",
        allIdeologies: "所有意识形态",
        sortUgiDesc: "UGI分数 ↓",
        sortUgiAsc: "UGI分数 ↑",
        sortW10Desc: "W/10分数 ↓",
        sortW10Asc: "W/10分数 ↑",
        
        // Rankings
        rankings: "🏆 排名",
        refreshNow: "立即刷新",
        refreshing: "正在刷新...",
        rank: "#",
        model: "模型",
        ideology: "意识形态",
        
        // Table
        loadingData: "正在加载排行榜数据...",
        errorLoading: "加载数据时出错。请稍后重试。",
        noModelsFound: "未找到符合条件的模型。",
        
        // Footer
        dataSourced: "数据来源于",
        ugiLeaderboard: "UGI排行榜",
        onHuggingFace: "在Hugging Face上",
        footerNote: "UGI衡量模型对非受限信息的认知能力 | W/10衡量回答意愿（0-10）",
        
        // Tooltips
        ugiTooltip: "非受限通用智能：敏感话题的知识广度（0-100）",
        w10Tooltip: "回答意愿：参与争议性话题（0-10）",
        
        // Back to top
        backToTop: "返回顶部"
    },
    
    ar: {
        // Header
        title: "لوحة تصنيف OpenUGI",
        subtitle: "رصد قدرات الذكاء العام غير المقيد في نماذج الذكاء الاصطناعي",
        liveIndicator: "مباشر",
        autoRefresh: "التحديث التلقائي في",
        
        // Stats
        totalModels: "إجمالي النماذج",
        topUgiScore: "أعلى نقاط UGI",
        lastUpdated: "آخر تحديث",
        
        // Jump button
        jumpToRankings: "↓ الانتقال إلى التصنيفات",
        
        // Understanding Scores Section
        understandingScores: "📊 فهم النقاط",
        ugiScore: "نقاط UGI",
        ugiRange: "النطاق: 0-100",
        ugiDescription: "يقيس <strong>نطاق المعرفة</strong> للنموذج في المواضيع غير المقيدة. تشير النقاط الأعلى إلى قدرة أكبر على فهم ومعالجة المعلومات المتنوعة والحساسة.",
        w10Score: "نقاط W/10",
        w10Range: "النطاق: 0-10",
        w10Description: "يشير إلى <strong>استعداد النموذج للمشاركة</strong> في المواضيع المثيرة للجدل. تظهر النقاط الأعلى تصفية محتوى أقل تقييدًا.",
        keyFactors: "العوامل الرئيسية:",
        ugiFactors: [
            "الدقة الواقعية في المواضيع المثيرة للجدل",
            "فهم القضايا الاجتماعية المعقدة",
            "معرفة الأحداث التاريخية الحساسة",
            "فهم وجهات النظر المتنوعة"
        ],
        w10Factors: [
            "معدل الاستجابة للأسئلة الحساسة",
            "عمق المشاركة في المواضيع",
            "التوازن بين السلامة والانفتاح",
            "الملاءمة السياقية"
        ],
        methodologyNote: "💡 <strong>ملاحظة:</strong> تستخدم لوحة تصنيف UGI أسئلة تقييم غير معلنة لمنع التلاعب بالمعايير والحفاظ على العدالة بين النماذج.",
        
        // Filters
        searchPlaceholder: "البحث عن النماذج...",
        allIdeologies: "جميع الأيديولوجيات",
        sortUgiDesc: "نقاط UGI ↓",
        sortUgiAsc: "نقاط UGI ↑",
        sortW10Desc: "نقاط W/10 ↓",
        sortW10Asc: "نقاط W/10 ↑",
        
        // Rankings
        rankings: "🏆 التصنيفات",
        refreshNow: "تحديث الآن",
        refreshing: "جاري التحديث...",
        rank: "#",
        model: "النموذج",
        ideology: "الأيديولوجية",
        
        // Table
        loadingData: "جاري تحميل بيانات لوحة التصنيف...",
        errorLoading: "خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقًا.",
        noModelsFound: "لم يتم العثور على نماذج مطابقة لمعاييرك.",
        
        // Footer
        dataSourced: "البيانات مصدرها من",
        ugiLeaderboard: "لوحة تصنيف UGI",
        onHuggingFace: "على Hugging Face",
        footerNote: "UGI يقيس معرفة النموذج بالمعلومات غير المقيدة | W/10 يقيس الاستعداد للإجابة (0-10)",
        
        // Tooltips
        ugiTooltip: "الذكاء العام غير المقيد: نطاق المعرفة في المواضيع الحساسة (0-100)",
        w10Tooltip: "الاستعداد للإجابة: المشاركة في المواضيع المثيرة للجدل (0-10)",
        
        // Back to top
        backToTop: "العودة إلى الأعلى"
    }
};