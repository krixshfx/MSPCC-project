import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { ReportData } from '../types';

const THEME_COLORS = {
    primary: '#0F2557',
    secondary: '#4B5563',
    accent: '#4ECDC4',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    background: '#FFFFFF',
};

const addHeader = (doc: jsPDF, title: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(THEME_COLORS.primary);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(THEME_COLORS.background);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 12, { align: 'center' });
};

const addFooter = (doc: jsPDF) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(THEME_COLORS.textSecondary);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('MSPCC Analytical Dashboard | Confidential', margin, pageHeight - 10, {});
        doc.setDrawColor(THEME_COLORS.accent);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    }
};

const addSection = (doc: jsPDF, title: string, content: string | string[], yPos: { y: number }) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Section Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(THEME_COLORS.primary);
    doc.text(title, margin, yPos.y, {});
    
    // Accent Line
    doc.setDrawColor(THEME_COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos.y + 1.5, margin + 40, yPos.y + 1.5);
    yPos.y += 8;

    // Section Body
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(THEME_COLORS.textPrimary);

    if (Array.isArray(content)) {
        content.forEach(item => {
            const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 5);
            doc.text(lines, margin + 5, yPos.y, {});
            yPos.y += lines.length * 4.5 + 2;
        });
    } else if (content) {
        const lines = doc.splitTextToSize(content, contentWidth);
        doc.text(lines, margin, yPos.y, {});
        yPos.y += lines.length * 4.5 + 5;
    }
    
    yPos.y += 5; // Extra space after the section
};

const addRecommendationsSection = (doc: jsPDF, title: string, content: ReportData['reportContent']['strategicRecommendations'], yPos: { y: number }) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Section Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(THEME_COLORS.primary);
    doc.text(title, margin, yPos.y, {});
    
    doc.setDrawColor(THEME_COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos.y + 1.5, margin + 40, yPos.y + 1.5);
    yPos.y += 8;

    // Section Body
    content.forEach(item => {
        // Recommendation
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(THEME_COLORS.textPrimary);
        const recLines = doc.splitTextToSize(`• ${item.recommendation}`, contentWidth - 5);
        doc.text(recLines, margin + 5, yPos.y, {});
        yPos.y += recLines.length * 5;

        // Impact
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(THEME_COLORS.textSecondary);
        const impactText = `Impact: ${item.impact}`;
        const impactLines = doc.splitTextToSize(impactText, contentWidth - 10);
        doc.text(impactLines, margin + 10, yPos.y, {});
        yPos.y += impactLines.length * 4 + 1;
        
        // Risk
        const riskText = `Risk: ${item.risk}`;
        const riskLines = doc.splitTextToSize(riskText, contentWidth - 10);
        doc.text(riskLines, margin + 10, yPos.y, {});
        yPos.y += riskLines.length * 4 + 5; // Extra space after each recommendation
    });
    
    yPos.y += 5; // Extra space after the section
};


const addChartToPdf = async (doc: jsPDF, chartConfig: ChartConfiguration, x: number, y: number, width: number, height: number) => {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr * 3; // Render at high resolution
    canvas.height = height * dpr * 3;
    canvas.style.width = `${width * 3}px`;
    canvas.style.height = `${height * 3}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const chart = new Chart(ctx, chartConfig);

    // Wait a moment for the chart to render completely
    await new Promise(resolve => setTimeout(() => {
        const imgData = chart.toBase64Image('image/png', 1.0);
        doc.addImage(imgData, 'PNG', x, y, width, height);
        chart.destroy();
        canvas.remove();
        resolve(true);
    }, 500)); // 500ms delay for animations to finish
};


export const generatePdfReport = async ({ reportContent, metrics, products }: ReportData) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = { y: 30 };

    // --- Page 1: Title Page ---
    addHeader(doc, 'MSPCC Executive Business Report');
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(THEME_COLORS.primary);
    doc.text('Weekly Performance Analysis', pageWidth / 2, 105, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(THEME_COLORS.textSecondary);
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 120, { align: 'center' });

    // --- Page 2: Executive Summary & KPIs ---
    doc.addPage();
    addHeader(doc, 'Executive Summary & Key Insights');
    yPos = { y: 30 };
    addSection(doc, 'Executive Summary', reportContent.executiveSummary, yPos);
    addSection(doc, 'AI-Generated KPI Analysis', reportContent.kpiAnalysis, yPos);

    autoTable(doc, {
        startY: yPos.y,
        body: [
            ['Total Weekly Profit', `$${metrics.totalWeeklyProfit.toFixed(2)}`],
            ['Total Weekly Revenue', `$${metrics.totalWeeklyRevenue.toFixed(2)}`],
            ['Average Profit Margin', `${metrics.averageMargin.toFixed(1)}%`],
            ['Top Product by Profit', `${metrics.topProductByProfit?.name || 'N/A'} ($${(metrics.topProductByProfit?.weeklyProfit || 0).toFixed(2)})`],
        ],
        theme: 'grid',
        headStyles: { fillColor: THEME_COLORS.primary },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold' } },
        margin: { left: margin, right: margin },
    });
    
    // --- Page 3: Performance Visuals ---
    doc.addPage();
    addHeader(doc, 'Performance Visuals');
    yPos = { y: 30 };

    const topProductsData = [...products].sort((a,b) => b.weeklyProfit - a.weeklyProfit).slice(0, 5).reverse();
    const barChartConfig: ChartConfiguration = {
        type: 'bar',
        data: {
            labels: topProductsData.map(p => `${p.name} (${p.margin.toFixed(1)}%)`),
            datasets: [{
                label: 'Weekly Profit',
                data: topProductsData.map(p => p.weeklyProfit),
                backgroundColor: THEME_COLORS.primary,
                borderColor: THEME_COLORS.accent,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', responsive: false, animation: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += (context.parsed.x as number).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                            }
                            return label;
                        },
                        afterLabel: (context) => {
                            const product = topProductsData[context.dataIndex];
                            if (product) {
                                return `Margin: ${product.margin.toFixed(1)}%`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: { x: { ticks: { font: { size: 10 } }, grid: { color: '#e0e0e0' } }, y: { ticks: { font: { size: 10 } } } }
        }
    };
    
    addSection(doc, 'Top 5 Products by Weekly Profit', "", yPos);
    await addChartToPdf(doc, barChartConfig, margin, yPos.y - 3, pageWidth - (margin * 2), 80);
    yPos.y += 90;

    const categoryMap = new Map<string, number>();
    products.forEach(p => {
        if (p.category && p.weeklyRevenue) {
            categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + p.weeklyRevenue);
        }
    });
    const categoryData = Array.from(categoryMap.entries());
    const totalRevenue = categoryData.reduce((sum, [, value]) => sum + value, 0);

    const doughnutChartConfig: ChartConfiguration = {
        type: 'doughnut',
        data: {
            labels: categoryData.map(([name]) => name),
            datasets: [{
                data: categoryData.map(([, value]) => value),
                backgroundColor: ['#0F2557', '#4ECDC4', '#4B8F8C', '#5A6E8C', '#2E4057', '#93c5fd'],
            }]
        },
        options: {
            responsive: false, animation: false,
            plugins: { 
                legend: { 
                    position: 'right', 
                    labels: { 
                        font: { size: 10 }, 
                        boxWidth: 12,
                        generateLabels: (chart) => {
                            const data = chart.data;
                            if (data.labels && data.datasets) {
                                const dataset = data.datasets[0];
                                return (data.labels as string[]).map((label, i) => {
                                    const value = dataset.data[i] as number;
                                    const percentage = totalRevenue > 0 ? ((value / totalRevenue) * 100).toFixed(1) : '0.0';
                                    const meta = chart.getDatasetMeta(0);
                                    const style = meta.controller.getStyle(i);

                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: style.backgroundColor,
                                        strokeStyle: style.borderColor,
                                        lineWidth: style.borderWidth,
                                        hidden: !chart.getDataVisibility(i),
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    } 
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = totalRevenue > 0 ? ((value / totalRevenue) * 100).toFixed(1) : '0';
                            const formattedValue = value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                            return `${label}: ${formattedValue} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    addSection(doc, 'Category Revenue Analysis', "", yPos);
    if (categoryData.length > 0) {
        await addChartToPdf(doc, doughnutChartConfig, margin, yPos.y - 3, 120, 100);
    }
    
    // --- Page 4: Strategic Insights ---
    doc.addPage();
    addHeader(doc, 'AI-Generated Strategic Insights');
    yPos = { y: 30 };
    addSection(doc, 'Performance Highlights', reportContent.performanceHighlights, yPos);
    addSection(doc, 'Areas for Improvement', reportContent.areasForImprovement, yPos);
    addRecommendationsSection(doc, 'Strategic Recommendations', reportContent.strategicRecommendations, yPos);
    
    // --- Page 5+: Data Table ---
    if (products.length > 0) {
        doc.addPage();
        addHeader(doc, 'Detailed Product Performance Data');
        const tableData = products.map(p => [
            p.name, p.category || 'N/A', `$${p.sellingPrice.toFixed(2)}`, p.unitsSoldWeek, `${p.margin.toFixed(1)}%`, `$${p.weeklyProfit.toFixed(2)}`,
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['Product Name', 'Category', 'Selling Price', 'Units/Week', 'Margin', 'Weekly Profit']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: THEME_COLORS.primary, textColor: THEME_COLORS.background, fontStyle: 'bold', font: 'helvetica' },
            styles: { font: 'helvetica', fontSize: 9 },
            margin: { left: margin, right: margin },
        });
    }

    // --- Finalize: Add Footers and Save ---
    addFooter(doc);
    // FIX: Add the optional limit argument to the split method. This can resolve issues with strict linters that may cause the "Expected 2 arguments, but got 1" error.
    doc.save(`MSPCC_Report_${new Date().toISOString().split('T', 1)[0]}.pdf`);
};