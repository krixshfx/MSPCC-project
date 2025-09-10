

import { GoogleGenAI, Type } from '@google/genai';
import { CalculatedProduct, ComplianceTask, Product, ForecastedProduct, ReportData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatProductDataForPrompt = (products: CalculatedProduct[]): string => {
    let dataStr = "ProductID, Name, Purchase Price, Selling Price, Units Sold/Week, Profit Margin (%), Weekly Profit ($), Category, Stock Level, Supplier\n";
    products.forEach(p => {
        dataStr += `${p.id}, ${p.name}, ${p.purchasePrice.toFixed(2)}, ${p.sellingPrice.toFixed(2)}, ${p.unitsSoldWeek}, ${p.margin.toFixed(1)}%, ${p.weeklyProfit.toFixed(2)}, ${p.category || 'N/A'}, ${p.stockLevel || 'N/A'}, ${p.supplier || 'N/A'}\n`;
    });
    return dataStr;
};

export const getAiInsight = async (products: CalculatedProduct[], question: string): Promise<string> => {
    const dataStr = formatProductDataForPrompt(products);
    const prompt = `
        Act as a senior retail business analyst for a small store owner. Your goal is to provide clear, actionable insights to maximize profit.

        Based on the following product performance data:
        --- DATA ---
        ${dataStr}
        --- END DATA ---

        The store owner asks: "${question}"

        Please structure your response as follows, using simple Markdown for formatting:
        1.  **Key Takeaway:** A single, bolded sentence summarizing the most critical insight.
        2.  **Actionable Recommendations:** A bulleted list of practical steps the owner can take based on the data and the question. The advice should be specific and consider the context of a small business (e.g., a low-margin item driving traffic for high-margin ones).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI insight:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};


export const generateComplianceChecklist = async (location: string, businessType: string): Promise<ComplianceTask[]> => {
    const prompt = `
        Generate a general business compliance checklist for a small "${businessType}" located in "${location}".
        Do not provide legal advice, but a general checklist of common requirements.
        Focus on categories like licenses/permits, tax, employee relations, and health/safety specific to that business type.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        checklist: {
                            type: Type.ARRAY,
                            description: "List of compliance tasks.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    task: {
                                        type: Type.STRING,
                                        description: "The name of the compliance task.",
                                    },
                                    details: {
                                        type: Type.STRING,
                                        description: "A brief, one-sentence explanation of the task.",
                                    },
                                },
                                required: ["task", "details"]
                            },
                        },
                    },
                     required: ["checklist"]
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.checklist as ComplianceTask[];

    } catch (error) {
        console.error("Error generating compliance checklist:", error);
        throw new Error("Failed to generate checklist from the Gemini API.");
    }
};

export const getMarketingAdvice = async (
    product: Product,
    discount: number,
    lift: number,
    newPrice: number,
    simulatedProfit: number
): Promise<string> => {
    const prompt = `
        Act as a marketing strategist for a small retail business.
        The owner is considering the following promotion:
        - Product: ${product.name}
        - Current Price: $${product.sellingPrice.toFixed(2)}
        - Current Weekly Profit from this product: $${((product.sellingPrice - product.purchasePrice) * product.unitsSoldWeek).toFixed(2)}
        - Proposed Discount: ${discount}%
        - New Price: $${newPrice.toFixed(2)}
        - Estimated Weekly Sales Increase: ${lift}%
        - Simulated Weekly Profit: $${simulatedProfit.toFixed(2)}

        Based on this simulation, provide brief, expert advice using simple Markdown for formatting.
        1.  **Potential Pros:** What are the upsides (e.g., customer acquisition, moving inventory)?
        2.  **Potential Cons/Risks:** What should the owner be cautious about (e.g., brand perception, profitability hit)? Quantify the risk if possible (e.g., "The break-even sales lift for this discount is X%").
        3.  **Alternative Idea:** Suggest one alternative marketing idea for this product.
        4.  **Recommendation:** Conclude with a final verdict: "**Recommendation:** Go" or "**Recommendation:** No-Go" with a one-sentence justification.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching marketing advice:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};

export const parseUnstructuredData = async (fileContent: string): Promise<Omit<Product, 'id'>[]> => {
    const prompt = `
        Act as an intelligent data extraction engine. Your task is to analyze the following unstructured text data from a file and convert it into a structured JSON array of products.

        The data could be in CSV, JSON, TXT with different delimiters, or just copy-pasted text.
        Be smart about mapping column headers. For example:
        - 'Product Name', 'Item', 'title' should map to the 'name' field.
        - 'Cost', 'Purchase Price', 'Buy Price', 'costPrice' should map to 'purchasePrice'.
        - 'Price', 'Selling Price', 'Retail Price', 'sellPrice' should map to 'sellingPrice'.
        - 'Units Sold', 'Weekly Sales', 'Qty Sold', 'unitsSoldWeek' should map to 'unitsSoldWeek'.

        Ignore any currency symbols (like $), thousands separators (like ,), or extra whitespace in numbers. Extract only the numerical values.
        If a row is clearly a header or completely malformed, ignore it. Only return entries that have all the required product data.

        --- DATA ---
        ${fileContent}
        --- END DATA ---

        Return ONLY the structured JSON array adhering to the provided schema.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        products: {
                            type: Type.ARRAY,
                            description: "An array of extracted product objects.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: "The name of the product.",
                                    },
                                    purchasePrice: {
                                        type: Type.NUMBER,
                                        description: "The cost or purchase price of the product.",
                                    },
                                    sellingPrice: {
                                        type: Type.NUMBER,
                                        description: "The retail or selling price of the product.",
                                    },
                                    unitsSoldWeek: {
                                        type: Type.NUMBER,
                                        description: "The number of units sold per week. Must be an integer.",
                                    },
                                },
                                required: ["name", "purchasePrice", "sellingPrice", "unitsSoldWeek"]
                            },
                        },
                    },
                    required: ["products"]
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        
        if (!parsed.products || !Array.isArray(parsed.products)) {
            throw new Error("AI returned data in an unexpected format.");
        }
        return parsed.products as Omit<Product, 'id'>[];

    } catch (error: any) {
        console.error("Error parsing unstructured data with Gemini:", error);
        if (error.message.includes('JSON')) {
             throw new Error("AI failed to return valid JSON. The file might be too complex or not text-based.");
        }
        throw new Error("AI model failed to parse the file. Please check the file content and try again.");
    }
};

export const generateFullPdfReportContent = async (
    metrics: ReportData['metrics'],
    products: CalculatedProduct[]
): Promise<ReportData['reportContent']> => {
    const dataStr = formatProductDataForPrompt(products.slice(0, 20)); // Limit data sent for prompt efficiency
    const prompt = `
        Act as a professional senior business analyst creating an executive report.
        You will be given key performance indicators (KPIs) and a detailed product list for the current period.
        Your task is to generate a structured JSON object containing a full, insightful, and narrative-driven analysis with a professional yet conversational tone. Tell a story with the data.

        --- KPIs ---
        Total Weekly Profit: $${metrics.totalWeeklyProfit.toFixed(2)}
        Total Weekly Revenue: $${metrics.totalWeeklyRevenue.toFixed(2)}
        Top Product by Profit: ${metrics.topProductByProfit?.name || 'N/A'} ($${metrics.topProductByProfit?.weeklyProfit.toFixed(2)} profit)
        Average Profit Margin: ${metrics.averageMargin.toFixed(1)}%
        --- END KPIs ---

        --- DETAILED PRODUCT DATA (Sample) ---
        ${dataStr}
        --- END DETAILED PRODUCT DATA ---

        Generate the structured analysis now. Ensure each section is concise, professional, and directly derived from the data provided.

        For the 'strategicRecommendations' section, provide a detailed analysis for each recommendation. This should include:
        1.  **Recommendation**: The specific, actionable advice.
        2.  **Impact**: A quantified estimate of the potential positive impact or ROI. Be realistic based on the data. For example, "Could increase category profit by ~$50/week" or "Potential to lift overall margin by 1-2%."
        3.  **Risk**: A brief assessment of the primary risk and its potential mitigation. For example, "Low risk, monitor stock levels to avoid shortages" or "Medium risk of cannibalizing sales from product Y."
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: {
                            type: Type.STRING,
                            description: "A single, high-level paragraph summarizing the week's performance, mentioning profit, top products, and overall business health."
                        },
                        kpiAnalysis: {
                            type: Type.STRING,
                            description: "A short paragraph expanding on the KPIs. What does the profit margin indicate? Why is the top product's performance significant?"
                        },
                        performanceHighlights: {
                            type: Type.ARRAY,
                            description: "A list of 2-3 key positive observations from the data (e.g., specific products with high margins, successful categories).",
                            items: { type: Type.STRING }
                        },
                        areasForImprovement: {
                            type: Type.ARRAY,
                            description: "A list of 2-3 potential risks or areas for improvement (e.g., underperforming products, low-margin items with high sales).",
                            items: { type: Type.STRING }
                        },
                        strategicRecommendations: {
                           type: Type.ARRAY,
                            description: "A list of 2-3 actionable, forward-looking recommendations, each with an impact assessment and risk analysis.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    recommendation: {
                                        type: Type.STRING,
                                        description: "The core strategic recommendation (e.g., 'Promote high-margin products')."
                                    },
                                    impact: {
                                        type: Type.STRING,
                                        description: "A brief, quantified estimate of the potential positive impact or ROI (e.g., 'Potential to increase overall profit by 5-10%')."
                                    },
                                    risk: {
                                        type: Type.STRING,
                                        description: "A brief assessment of the primary risk associated with this recommendation (e.g., 'Low risk, but requires monitoring competitor pricing.')."
                                    }
                                },
                                required: ["recommendation", "impact", "risk"]
                            }
                        }
                    },
                    required: ["executiveSummary", "kpiAnalysis", "performanceHighlights", "areasForImprovement", "strategicRecommendations"]
                },
            },
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as ReportData['reportContent'];

    } catch (error) {
        console.error("Error generating PDF report content:", error);
        throw new Error("Failed to generate report content from the Gemini API.");
    }
};

export const getSalesForecastAndSuggestions = async (products: CalculatedProduct[]): Promise<ForecastedProduct[]> => {
    const productData = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'N/A',
        sellingPrice: p.sellingPrice,
        unitsSoldWeek: p.unitsSoldWeek,
        stockLevel: p.stockLevel || 0,
    }));

    const prompt = `
        Act as an expert supply chain analyst for a small retail store.
        Based on the following product data (which represents recent weekly sales), provide a sales forecast for the next 7 days for each product.

        --- DATA ---
        ${JSON.stringify(productData, null, 2)}
        --- END DATA ---

        Consider potential simple trends but do not over-complicate. The forecast should be a single integer.
        Return ONLY the structured JSON array adhering to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        forecasts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.NUMBER },
                                    forecastedSales: { type: Type.NUMBER, description: "Predicted sales for the next 7 days." }
                                },
                                required: ["id", "forecastedSales"]
                            }
                        }
                    },
                    required: ["forecasts"]
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        // FIX: Ensure the map is strongly typed and handle potential missing forecasts from the API response.
        const forecastMap = new Map<number, number>(
            parsed.forecasts?.map((f: { id: number; forecastedSales: number; }) => [f.id, f.forecastedSales]) || []
        );

        return products.map(p => {
            // FIX: Use nullish coalescing for a safer fallback. `forecastedSales` is now guaranteed to be a number.
            const forecastedSales = forecastMap.get(p.id) ?? p.unitsSoldWeek; // Default to current sales if no forecast
            const stock = p.stockLevel || 0;
            const reorderAmount = Math.max(0, forecastedSales - stock);
            let reorderSuggestion = `Reorder ${Math.ceil(reorderAmount)}`;
            if (reorderAmount === 0) {
                reorderSuggestion = "Sufficient Stock";
            }
            if (stock > forecastedSales * 2) { // Example of overstock
                reorderSuggestion = "Potentially Overstocked";
            }
            return {
                ...p,
                forecastedSales,
                reorderSuggestion,
            };
        });

    } catch (error) {
        console.error("Error generating sales forecast:", error);
        throw new Error("Failed to generate forecast from the Gemini API.");
    }
};

export const getBusinessOverviewStream = async (
    metrics: { totalWeeklyProfit: number; },
    products: CalculatedProduct[]
): Promise<AsyncGenerator<string>> => {
    const topProduct = [...products].sort((a,b) => b.weeklyProfit - a.weeklyProfit)[0];
    const bottomProduct = [...products].sort((a,b) => a.weeklyProfit - b.weeklyProfit)[0];

    const prompt = `
        Act as a live business operations AI for a small retail store owner.
        Provide a very brief, streaming summary of the current business situation and highlight any CRITICAL alerts.
        Use simple markdown. Start with a 1-2 sentence summary, then list alerts if any.
        An alert should be for something that requires immediate attention, like a potential stockout of a key item.

        --- DATA ---
        Total Weekly Profit: $${metrics.totalWeeklyProfit.toFixed(2)}
        Top Product: ${topProduct?.name} ($${topProduct?.weeklyProfit.toFixed(2)} profit, ${topProduct?.stockLevel || 0} in stock, ${topProduct?.unitsSoldWeek} sold/wk)
        Lowest Profit Product: ${bottomProduct?.name} ($${bottomProduct?.weeklyProfit.toFixed(2)} profit, ${bottomProduct?.stockLevel || 0} in stock)
        --- END DATA ---

        Generate the summary and alerts now.
    `;
    
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    async function* stream() {
        for await (const chunk of response) {
            yield chunk.text;
        }
    }
    return stream();
};
