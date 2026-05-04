import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import { 
  LayoutDashboard, Users, Calendar, BarChart3, 
  LogOut, Cpu, FileDown, TrendingUp, DollarSign
} from 'lucide-react';

function AdminAnalytics() {
    const navigate = useNavigate();
    const chartRefs = useRef({});
    const chartContainers = useRef({});
    
    // State for Metrics
    const [stats, setStats] = useState({
        totalAlumni: 0,
        placementRate: 0,
        avgSalary: 0,
       
        employedCount: 0,
        activeEvents: 0
    });

    const [yearlyPlacements, setYearlyPlacements] = useState([]);
    const [departmentDistribution, setDepartmentDistribution] = useState([]);
    const [aiInsights, setAiInsights] = useState("Click 'Analyze' to generate AI-powered strategic recommendations for improving placement rates based on your current data.");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 1. Load All Analytics Data
    const loadAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/auth/adminstats", {
                headers: { 'auth-token': token }
            });
            const data = await response.json();
            
            if (response.ok) {
                // Calculate placement percentage
                const placementPercentage = data.totalAlumni > 0 
                    ? parseFloat(((data.employedCount / data.totalAlumni) * 100).toFixed(1))
                    : 0;

                setStats({
                    totalAlumni: data.totalAlumni || 0,
                    placementRate: placementPercentage,
                    avgSalary: data.averageSalary || 0,
                   
                    employedCount: data.employedCount || 0,
                    activeEvents: data.activeEvents || 0
                });

                // Set yearly placements data
                if (data.yearlyPlacements && data.yearlyPlacements.length > 0) {
                    setYearlyPlacements(data.yearlyPlacements);
                }

                // Set department distribution
                if (data.departmentDistribution && data.departmentDistribution.length > 0) {
                    setDepartmentDistribution(data.departmentDistribution);
                }
                
                initializeCharts(data.yearlyPlacements || [], data.departmentDistribution || []);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    };

    // 2. Initialize Charts with Real Data
    const initializeCharts = (placements, departments) => {
        const destroyChart = (id) => { if (chartRefs.current[id]) chartRefs.current[id].destroy(); };

        // Filter out null/invalid years from placements
        const filteredPlacements = placements.filter(p => p._id && p._id !== null && !isNaN(p._id));

        // Placement Trends Bar Chart (using yearly placements data)
        destroyChart('placement');
        const ctxPlacement = document.getElementById('placementChart');
        if (ctxPlacement && filteredPlacements.length > 0) {
            const labels = filteredPlacements.map(p => `Year ${p._id}`);
            const data = filteredPlacements.map(p => p.placementPercentage);
            
            chartRefs.current.placement = new Chart(ctxPlacement, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Placement Rate (%)',
                        data: data,
                        backgroundColor: '#f59e0b',
                        borderColor: '#d97706',
                        borderWidth: 2,
                        borderRadius: 8,
                        tension: 0.4
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: { display: true, position: 'top' },
                        title: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }

        // Filter out null/unknown departments
        const filteredDepartments = departments.filter(d => d._id && d._id !== null && d._id !== 'Unknown' && d._id !== '');

        // Department Distribution Bar Chart
        destroyChart('dept');
        const ctxDept = document.getElementById('departmentChart');
        if (ctxDept && filteredDepartments.length > 0) {
            const deptLabels = filteredDepartments.map(d => d._id);
            const deptData = filteredDepartments.map(d => d.count);
            const colors = ['#d97706', '#f59e0b', '#fbbf24', '#fef3c7', '#dbeafe', '#93c5fd'];
            
            chartRefs.current.dept = new Chart(ctxDept, {
                type: 'bar',
                data: {
                    labels: deptLabels,
                    datasets: [{
                        label: 'Alumni Count',
                        data: deptData,
                        backgroundColor: colors.slice(0, deptLabels.length),
                        borderColor: '#d97706',
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: { display: true, position: 'top' }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    };

    useEffect(() => {
        loadAnalytics();
        const currentCharts = chartRefs.current;
        return () => {
            Object.values(currentCharts).forEach(chart => chart && chart.destroy());
        };
    }, []);

    // 3. AI Insight Generation - AI-powered suggestions based on placement data
    const generateAIInsights = async () => {
    setIsAnalyzing(true);
    setAiInsights("Gemini AI is analyzing alumni patterns...");

    try {
        const response = await fetch("http://localhost:5000/api/alumni/generate-placement-insights", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            },
            body: JSON.stringify({ 
                stats,
                yearlyPlacements,
                departmentDistribution
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            setAiInsights(formatAIInsights(data.insights));
        } else {
            setAiInsights(`AI service error: ${data.error || "Service temporarily unavailable"}`);
        }
    } catch (error) {
        console.error("Error:", error);
        setAiInsights("Error connecting to AI service. Please check your internet connection.");
    } finally {
        setIsAnalyzing(false);
    }
    };

    // 4. Format AI Insights into structured HTML
    const formatAIInsights = (rawInsights) => {
        // Split the response into sections based on common patterns
        const sections = {
            title: "AI-Powered Placement Strategy Report",
            summary: "",
            keyInsights: [],
            detailedAnalysis: "",
            recommendations: []
        };

        // Try to extract sections from the AI response
        const lines = rawInsights.split('\n').filter(line => line.trim());
        let currentSection = 'summary';

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Check for section headers
            if (trimmedLine.toLowerCase().includes('overall assessment') || 
                trimmedLine.toLowerCase().includes('assessment') ||
                trimmedLine.toLowerCase().includes('summary')) {
                currentSection = 'summary';
                continue;
            } else if (trimmedLine.toLowerCase().includes('key insights') || 
                      trimmedLine.toLowerCase().includes('insights')) {
                currentSection = 'keyInsights';
                continue;
            } else if (trimmedLine.toLowerCase().includes('detailed analysis') || 
                      trimmedLine.toLowerCase().includes('analysis')) {
                currentSection = 'detailedAnalysis';
                continue;
            } else if (trimmedLine.toLowerCase().includes('recommendations') || 
                      trimmedLine.toLowerCase().includes('strategies') ||
                      trimmedLine.toLowerCase().includes('action items')) {
                currentSection = 'recommendations';
                continue;
            }

            // Add content to current section
            if (currentSection === 'keyInsights' && (trimmedLine.startsWith('-') || trimmedLine.startsWith('•'))) {
                sections.keyInsights.push(trimmedLine.substring(1).trim());
            } else if (currentSection === 'recommendations' && (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine))) {
                sections.recommendations.push(trimmedLine.replace(/^\d+\.\s*/, '').trim());
            } else if (currentSection === 'summary' && sections.summary === '') {
                sections.summary = trimmedLine;
            } else if (currentSection === 'detailedAnalysis') {
                sections.detailedAnalysis += (sections.detailedAnalysis ? ' ' : '') + trimmedLine;
            } else if (currentSection === 'summary' && sections.summary) {
                sections.summary += ' ' + trimmedLine;
            }
        }

        // If parsing failed, use the raw content as summary
        if (!sections.summary && !sections.keyInsights.length && !sections.detailedAnalysis && !sections.recommendations.length) {
            sections.summary = rawInsights;
        }

        // Generate formatted HTML
        return `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #374151;">
    <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
        ${sections.title}
    </h1>
    
    ${sections.summary ? `
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Summary</h2>
        <p style="font-size: 14px; color: #4b5563;">${sections.summary}</p>
    </div>
    ` : ''}
    
    ${sections.keyInsights.length > 0 ? `
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">Key Insights</h2>
        <ul style="font-size: 14px; color: #4b5563; padding-left: 20px;">
            ${sections.keyInsights.map(insight => `<li style="margin-bottom: 6px;">${insight}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    ${sections.detailedAnalysis ? `
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Detailed Analysis</h2>
        <p style="font-size: 14px; color: #4b5563;">${sections.detailedAnalysis}</p>
    </div>
    ` : ''}
    
    ${sections.recommendations.length > 0 ? `
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">Recommendations</h2>
        <ul style="font-size: 14px; color: #4b5563; padding-left: 20px;">
            ${sections.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
</div>`.trim();
    };


    // 4. Check Available AI Models
    const checkAvailableModels = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/alumni/list-models", {
                headers: {
                    "auth-token": localStorage.getItem('token')
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                setAiInsights(`Available models: ${data.availableModels.map(m => m.name).join(', ')}`);
            } else {
                setAiInsights(`Model check failed: ${data.error || "Unable to fetch models"}`);
            }
        } catch (error) {
            console.error("Error checking models:", error);
            setAiInsights("Error checking available models. Please try again.");
        }
    };

  const exportReport = async () => {
    if (!chartRefs.current.placement || !chartRefs.current.dept) {
        alert("Charts are still loading. Please wait.");
        return;
    }
    
    try {
        console.log('Starting PDF export...');
        
        // 1. Create PDF instance
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // 2. Header
        doc.setFontSize(22);
        doc.setTextColor(31, 41, 55);
        doc.text("Alumni Analytics Report 2026", pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // 3. Stats Table (using jspdf-autotable)
        console.log('Adding stats table...');
       autoTable(doc, {
  startY: yPosition,
  head: [['Metric', 'Value']],
  body: [
    ['Total Alumni', stats.totalAlumni.toString()],
    ['Placement Rate', `${stats.placementRate}%`],
    ['Average Salary', stats.avgSalary > 0 ? `${stats.avgSalary} Lakhs` : 'N/A'],
    ['Active Events', stats.activeEvents.toString()]
  ],
  theme: 'striped',
  headStyles: { fillColor: [217, 119, 6] }
});

        yPosition = doc.lastAutoTable?.finalY
  ? doc.lastAutoTable.finalY + 15
  : yPosition + 20;

        // 4. Capture Charts using Chart.js toBase64Image
        console.log('Adding charts...');
        const chartConfigs = [
            { chart: chartRefs.current.placement, title: 'Placement Trends' },
            { chart: chartRefs.current.dept, title: 'Department Distribution' }
        ];

        for (const config of chartConfigs) {
            if (config.chart) {
                try {
                    console.log(`Processing chart: ${config.title}`);
                    
                    // Use Chart.js built-in method to get base64 image
                    const imgData = config.chart.canvas.toDataURL("image/png", 1.0);
                    
                    // Calculate dimensions (assuming 4:3 aspect ratio for charts)
                    const imgWidth = pageWidth - 40;
                    const imgHeight = (imgWidth * 3) / 4; // 4:3 aspect ratio

                    // Check for page overflow - ensure enough space for chart + title + margin
                    if (yPosition + imgHeight + 25 > pageHeight - 20) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.setFontSize(12);
                    doc.setTextColor(31, 41, 55);
                    doc.text(config.title, 20, yPosition);
                    yPosition += 5;

                    doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 15;
                    
                    console.log(`Successfully added chart: ${config.title}`);
                } catch (chartError) {
                    console.error(`Error processing chart ${config.title}:`, chartError);
                    // Continue with other charts
                }
            } else {
                console.warn(`Chart not found: ${config.title}`);
            }
        }

        // 5. AI Insights Section - Multi-page support
        console.log('Adding AI insights...');
        
        // Function to add text with automatic page breaks
        const addTextWithPageBreaks = (text, fontSize = 10, lineHeight = 5) => {
            doc.setFontSize(fontSize);
            doc.setTextColor(75, 85, 99);
            
            const lines = doc.splitTextToSize(text, pageWidth - 40);
            let currentY = yPosition;
            
            for (let i = 0; i < lines.length; i++) {
                // Check if we need a new page
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    currentY = 20; // Reset to top margin
                    
                    // Re-add header on new page
                    doc.setFontSize(14);
                    doc.setTextColor(31, 41, 55);
                    doc.text("AI-Powered Placement Strategy Recommendations (continued)", 20, currentY);
                    currentY += 8;
                    doc.setFontSize(fontSize);
                    doc.setTextColor(75, 85, 99);
                }
                
                doc.text(lines[i], 20, currentY);
                currentY += lineHeight;
            }
            
            return currentY;
        };

        // Add AI insights header
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text("AI-Powered Placement Strategy Recommendations", 20, yPosition);
        yPosition += 10;

        // Add AI insights content with multi-page support
        if (aiInsights && aiInsights.trim()) {
            // Remove HTML tags for PDF (simple text extraction)
            const cleanInsights = aiInsights
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&nbsp;/g, ' ') // Replace HTML spaces
                .replace(/\n\s*\n/g, '\n') // Remove extra newlines
                .trim();
            
            yPosition = addTextWithPageBreaks(cleanInsights, 10, 5);
        } else {
            yPosition = addTextWithPageBreaks("No AI insights available. Please generate insights first.", 10, 5);
        }

        // 6. Footer on last page
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, pageHeight - 10);
        }

        // 7. Final Save
        console.log('Saving PDF...');
        const fileName = `Alumni_Analytics_Report_${new Date().getTime()}.pdf`;
        doc.save(fileName);
        
        console.log('PDF export completed successfully!');
        alert(`PDF report generated successfully! (${totalPages} pages)`);

    } catch (error) {
        console.error('PDF Export Error:', error);
        alert(`Failed to generate PDF: ${error.message}`);
    }
};

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-left">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#1e293b] text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center font-bold shadow-lg">A</div>
                        <span className="font-bold text-sm tracking-tight">ADMIN <br/><small className="text-[10px] text-slate-400 uppercase">Panel Control</small></span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/adminDashboard" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/adminAlumni" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <Users size={18} /> <span className="text-sm">Manage Alumni</span>
                    </Link>
                    <Link to="/adminEvents" className="flex items-center gap-3 w-full p-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-all no-underline">
                        <Calendar size={18} /> <span className="text-sm">Manage Events</span>
                    </Link>
                    <Link to="/adminAnalytics" className="flex items-center gap-3 w-full p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-600/20 no-underline">
                        <BarChart3 size={18} /> <span className="text-sm font-semibold">Analytics</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all bg-transparent border-0 cursor-pointer text-left font-bold">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1 text-left">Analytics Dashboard</h2>
                    <p className="text-sm text-slate-500 text-left">Real-time data visualization of institutional growth.</p>
                </header>

                {/* METRIC CARDS */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20}/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Total Alumni</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.totalAlumni}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp size={20}/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Placement</span>
                        </div>
                        <h3 className="text-2xl font-bold text-amber-600">{stats.placementRate}%</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20}/></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Avg Salary</span>
                        </div>
                        <h3 className="text-2xl font-bold text-green-600">{stats.avgSalary > 0 ? `${stats.avgSalary}L` : 'N/A'}</h3>
                    </div> 
                </div>

                {/* CHARTS SECTION */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h5 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-left">
                            <TrendingUp size={18} className="text-amber-600"/> Placement Trends
                        </h5>
                        <div className="h-[300px]" ref={el => chartContainers.current.placement = el}>
                            <canvas id="placementChart"></canvas>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left">
                        <h5 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Users size={18} className="text-amber-600"/> Dept Distribution
                        </h5>
                        <div className="h-[300px]" ref={el => chartContainers.current.dept = el}>
                            <canvas id="departmentChart"></canvas>
                        </div>
                    </div>
                </div>

                {/* AI INSIGHT BOX */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-8 border-amber-600 border-t border-r border-b border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-inner">
                                <Cpu size={24} className={isAnalyzing ? "animate-spin" : ""} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-900 mb-0">AI-Powered Placement Insights</h4>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Strategic Recommendations</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={checkAvailableModels}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 border-0 cursor-pointer"
                            >
                                <TrendingUp size={16} /> Check Models
                            </button>
                            <button 
                                onClick={generateAIInsights}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all border-0 cursor-pointer disabled:opacity-50"
                            >
                                {isAnalyzing ? "Analyzing..." : "Analyze"}
                            </button>
                            
                            <button 
                                onClick={exportReport}
                                className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-600/20 border-0 cursor-pointer"
                            >
                                <FileDown size={16} /> Export PDF
                            </button>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-left leading-relaxed" 
                         dangerouslySetInnerHTML={{ __html: aiInsights }}>
                    </div>
                </div>
            </main>
        </div>
    );

   
}

export default AdminAnalytics;
