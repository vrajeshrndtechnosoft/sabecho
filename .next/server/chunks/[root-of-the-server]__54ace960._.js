module.exports = {

"[project]/.next-internal/server/app/api/v1/categories/all/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/mongoose [external] (mongoose, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}}),
"[project]/lib/db.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "closeDbConnection": (()=>closeDbConnection),
    "connectDb": (()=>connectDb)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true
};
// Keep track of the connection status
let isConnected = false;
const connectDb = async ()=>{
    if (isConnected) {
        // Already connected
        return;
    }
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connect(process.env.MONGODB_URI, options);
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log(`DB connection error - ${err}`);
        throw err;
    }
};
const closeDbConnection = async ()=>{
    try {
        await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connection.close();
        isConnected = false;
        console.log("MongoDB connection closed");
    } catch (err) {
        console.error(err);
    }
};
;
}}),
"[project]/models/Category.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// models/Category.ts
__turbopack_context__.s({
    "Category": (()=>Category),
    "Counter": (()=>Counter)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
const counterSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    _id: {
        type: String,
        required: true
    },
    sequence_value: {
        type: Number,
        required: true
    }
});
const Counter = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Counter || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("Counter", counterSchema);
/* -------------------- SUBCATEGORY SCHEMA -------------------- */ const subCategorySchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    id: {
        type: Number
    },
    name: {
        type: String
    },
    slug: {
        type: String
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    keywords: [
        {
            type: String
        }
    ],
    product: [
        {
            p_name: {
                type: String
            },
            location: {
                type: String
            },
            city: {
                type: String
            },
            brand: {
                type: String,
                default: ""
            }
        }
    ]
});
/* -------------------- CATEGORY SCHEMA -------------------- */ const categorySchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["Schema"]({
    id: {
        type: Number,
        unique: true
    },
    category: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    keywords: [
        {
            type: String
        }
    ],
    subCategory: [
        subCategorySchema
    ]
}, {
    timestamps: true
});
/* -------------------- AUTO INCREMENT LOGIC -------------------- */ async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findByIdAndUpdate(sequenceName, {
        $inc: {
            sequence_value: 1
        }
    }, {
        new: true,
        upsert: true
    });
    return sequenceDocument.sequence_value;
}
async function getNextSubCategoryId(categoryId) {
    const sequenceName = `subCategoryId_${categoryId}`;
    const sequenceDocument = await Counter.findByIdAndUpdate(sequenceName, {
        $inc: {
            sequence_value: 1
        }
    }, {
        new: true,
        upsert: true
    });
    return sequenceDocument.sequence_value;
}
/* -------------------- PRE SAVE MIDDLEWARE -------------------- */ categorySchema.pre("save", async function(next) {
    if (this.isNew) {
        this.id = await getNextSequenceValue("categoryId");
    }
    if (!this.slug) {
        this.slug = this.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    for (const subCategory of this.subCategory){
        if (!subCategory.id) {
            subCategory.id = await getNextSubCategoryId(this.id);
        }
        if (!subCategory.slug && subCategory.name) {
            subCategory.slug = subCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
    }
    next();
});
/* -------------------- DELETE MIDDLEWARE -------------------- */ categorySchema.pre("deleteOne", {
    document: true,
    query: false
}, async function(next) {
    try {
        const category = this;
        const CategoryModel = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("Category");
        for (const subCategory of category.subCategory){
            // Only delete subCategory if it exists by _id (assuming `subCategory.id` is just a number and not ObjectId)
            await CategoryModel.findOneAndDelete({
                id: subCategory.id
            });
        }
        next();
    } catch (error) {
        next(error);
    }
});
/* -------------------- MODEL EXPORT -------------------- */ const Category = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.Category || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("Category", categorySchema);
;
}}),
"[project]/app/api/v1/categories/all/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// File: app/api/categories/all/route.ts
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Category$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Category.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDb"])();
        const categories = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Category$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Category"].find();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(categories, {
            status: 200
        });
    } catch (error) {
        console.error(error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__54ace960._.js.map