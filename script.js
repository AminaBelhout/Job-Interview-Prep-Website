// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// Initialize jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const resumeForm = document.getElementById('resumeForm');
    const resumeFileInput = document.getElementById('resumeFile');
    const fileNameSpan = document.getElementById('fileName');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    const resultsSection = document.getElementById('resultsSection');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadDocxBtn = document.getElementById('downloadDocx');
    const practiceQuestionsContainer = document.getElementById('practiceQuestions');
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackContent = document.getElementById('feedbackContent');
    
    // Store extracted resume text and questions
    let resumeText = '';
    let position = '';
    let experienceLevel = '';
    let allQuestions = { technical: [], behavioral: [], situational: [], company: [] };
    
    // File input change handler
    resumeFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileNameSpan.textContent = this.files[0].name;
        } else {
            fileNameSpan.textContent = 'No file chosen';
        }
    });
    
    // Tab button click handler
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Form submission handler
    resumeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        position = document.getElementById('position').value;
        experienceLevel = document.getElementById('experienceLevel').value;
        const file = resumeFileInput.files[0];
        
        if (!file) {
            alert('Please upload your resume');
            return;
        }
        
        // Show loading state
        btnText.textContent = 'Processing...';
        loader.style.display = 'block';
        generateBtn.disabled = true;
        
        try {
            // Extract text from resume
            resumeText = await extractTextFromResume(file);
            
            // Generate questions with DeepSeek
            const questions = await generateQuestionsWithDeepSeek(resumeText, position, experienceLevel);
            allQuestions = categorizeQuestions(questions);
            
            // Display questions
            displayQuestions();
            
            // Set up practice test
            setupPracticeTest();
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing your resume. Please try again.');
        } finally {
            // Reset button state
            btnText.textContent = 'Generate Questions';
            loader.style.display = 'none';
            generateBtn.disabled = false;
        }
    });
    
    // Download PDF handler
    downloadPdfBtn.addEventListener('click', function() {
        generatePdf();
    });
    
    // Download DOCX handler (simulated)
    downloadDocxBtn.addEventListener('click', function() {
        alert('DOCX download would be implemented with a library like docx.js in a production environment');
    });
    
    // Function to extract text from resume (PDF or DOCX)
    async function extractTextFromResume(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'pdf') {
            return await extractTextFromPdf(file);
        } else if (fileExtension === 'docx') {
            return await extractTextFromDocx(file);
        } else {
            throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
        }
    }
    
    // Function to extract text from PDF
    async function extractTextFromPdf(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = async function() {
                try {
                    const typedArray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let text = '';
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const strings = content.items.map(item => item.str);
                        text += strings.join(' ') + '\n';
                    }
                    
                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };
            
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(file);
        });
    }
    
    // Function to extract text from DOCX
    async function extractTextFromDocx(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = function() {
                mammoth.extractRawText({ arrayBuffer: this.result })
                    .then(function(result) {
                        resolve(result.value);
                    })
                    .catch(reject);
            };
            
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(file);
        });
    }
    
    // Function to generate questions with DeepSeek
    async function generateQuestionsWithDeepSeek(resumeText, position, experienceLevel) {
        // In a real implementation, you would call the DeepSeek API here
        // This is a simulation that returns mock data after a delay
        
        return new Promise(resolve => {
            setTimeout(() => {
                const mockQuestions = generateMockQuestions(resumeText, position, experienceLevel);
                resolve(mockQuestions);
            }, 1500); // Simulate API delay
        });
    }
    
    // Function to generate mock questions for demonstration
    function generateMockQuestions(resumeText, position, experienceLevel) {
        // This generates mock questions based on the position and experience level
        // In a real app, these would come from the DeepSeek API
        
        const baseQuestions = [
            {
                question: `Can you walk us through your experience with troubleshooting technical issues?`,
                answer: `Based on your resume, you have experience with troubleshooting various technical issues. Highlight specific examples from your past roles where you successfully resolved technical problems. Mention any tools or methodologies you used.`,
                type: 'technical'
            },
            {
                question: `How do you prioritize multiple support tickets when they all seem urgent?`,
                answer: `This tests your organizational skills. Discuss how you assess urgency and impact, possibly using a ticketing system. Mention if you follow any specific framework like ITIL for prioritization.`,
                type: 'situational'
            },
            {
                question: `Describe a time when you had to explain a complex technical issue to a non-technical person.`,
                answer: `Use the STAR method (Situation, Task, Action, Result) to describe a specific instance. Focus on how you simplified the explanation and what the outcome was.`,
                type: 'behavioral'
            },
            {
                question: `What experience do you have with our specific technologies mentioned in the job description?`,
                answer: `Review the technologies listed in the job description and match them to your experience. Even if you don't have direct experience, discuss similar technologies you've worked with and your ability to learn quickly.`,
                type: 'company'
            }
        ];
        
        // Add position-specific questions
        if (position.toLowerCase().includes('help desk')) {
            baseQuestions.push(
                {
                    question: `How would you handle an angry customer who is frustrated with a recurring technical issue?`,
                    answer: `Demonstrate your customer service skills. Explain how you would remain calm, empathize with the user, systematically troubleshoot the issue, and follow up to ensure resolution.`,
                    type: 'situational'
                },
                {
                    question: `What remote support tools are you familiar with?`,
                    answer: `List the remote support tools you've used (TeamViewer, Remote Desktop, etc.). If you don't have direct experience, mention your technical aptitude and ability to learn new tools quickly.`,
                    type: 'technical'
                }
            );
        }
        
        // Add experience-level specific questions
        if (experienceLevel === 'entry') {
            baseQuestions.push(
                {
                    question: `As someone new to the field, how do you stay updated with the latest technology trends?`,
                    answer: `Discuss your learning habits - online courses, tech blogs, forums, or professional networks. Show your enthusiasm for continuous learning in the IT field.`,
                    type: 'behavioral'
                }
            );
        } else if (experienceLevel === 'mid' || experienceLevel === 'senior') {
            baseQuestions.push(
                {
                    question: `Can you describe a time when you mentored or trained junior staff members?`,
                    answer: `Provide a specific example of when you helped train or mentor others. Focus on your communication skills and ability to break down complex topics.`,
                    type: 'behavioral'
                }
            );
        }
        
        return baseQuestions;
    }
    
    // Function to categorize questions by type
    function categorizeQuestions(questions) {
        const categorized = {
            technical: [],
            behavioral: [],
            situational: [],
            company: []
        };
        
        questions.forEach(q => {
            if (categorized[q.type]) {
                categorized[q.type].push(q);
            }
        });
        
        return categorized;
    }
    
    // Function to display questions in their respective sections
    function displayQuestions() {
        const questionContainers = {
            technical: document.getElementById('technicalQuestions'),
            behavioral: document.getElementById('behavioralQuestions'),
            situational: document.getElementById('situationalQuestions'),
            company: document.getElementById('companyQuestions')
        };
        
        // Clear all containers
        Object.values(questionContainers).forEach(container => {
            container.innerHTML = '';
        });
        
        // Populate the containers with questions
        for (const [type, questions] of Object.entries(allQuestions)) {
            const container = questionContainers[type];
            
            if (questions.length === 0) {
                container.innerHTML = `<p class="no-questions">No ${type} questions generated.</p>`;
                continue;
            }
            
            questions.forEach(q => {
                const questionItem = document.createElement('div');
                questionItem.className = 'question-item';
                
                questionItem.innerHTML = `
                    <div class="question-text">${q.question}</div>
                    <div class="answer-text">${q.answer}</div>
                `;
                
                container.appendChild(questionItem);
            });
        }
    }
    
    // Function to set up the practice test
    function setupPracticeTest() {
        practiceQuestionsContainer.innerHTML = '';
        
        // Combine all questions for practice
        const allPracticeQuestions = [
            ...allQuestions.technical,
            ...allQuestions.behavioral,
            ...allQuestions.situational,
            ...allQuestions.company
        ];
        
        if (allPracticeQuestions.length === 0) {
            practiceQuestionsContainer.innerHTML = '<p>No questions available for practice.</p>';
            return;
        }
        
        // Display up to 5 random questions for practice
        const practiceQuestions = getRandomQuestions(allPracticeQuestions, 5);
        
        practiceQuestions.forEach((q, index) => {
            const practiceItem = document.createElement('div');
            practiceItem.className = 'practice-question';
            practiceItem.dataset.question = q.question;
            practiceItem.dataset.answer = q.answer;
            
            practiceItem.innerHTML = `
                <h4>Question ${index + 1}: ${q.question}</h4>
                <textarea class="answer-input" placeholder="Type your answer here..." data-question="${q.question}"></textarea>
                <button class="show-answer-btn">Show Model Answer</button>
                <button class="get-feedback-btn">Get AI Feedback</button>
                <div class="model-answer">
                    <strong>Model Answer:</strong>
                    <p>${q.answer}</p>
                </div>
            `;
            
            practiceQuestionsContainer.appendChild(practiceItem);
        });
        
        // Add event listeners to practice buttons
        document.querySelectorAll('.show-answer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const answerDiv = this.nextElementSibling.nextElementSibling;
                answerDiv.style.display = answerDiv.style.display === 'block' ? 'none' : 'block';
            });
        });
        
        document.querySelectorAll('.get-feedback-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const answerInput = this.previousElementSibling;
                const userAnswer = answerInput.value.trim();
                const question = answerInput.dataset.question;
                
                if (!userAnswer) {
                    alert('Please enter your answer before requesting feedback.');
                    return;
                }
                
                // Show loading on button
                const originalText = this.textContent;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
                this.disabled = true;
                
                try {
                    // Simulate AI feedback (in real app, call DeepSeek API)
                    const feedback = await getAIFeedback(question, userAnswer);
                    
                    feedbackContent.innerHTML = feedback;
                    feedbackSection.style.display = 'block';
                    feedbackSection.scrollIntoView({ behavior: 'smooth' });
                } catch (error) {
                    console.error('Error getting feedback:', error);
                    alert('Error getting feedback. Please try again.');
                } finally {
                    this.textContent = originalText;
                    this.disabled = false;
                }
            });
        });
    }
    
    // Function to get random questions for practice
    function getRandomQuestions(questions, count) {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    
    // Function to simulate AI feedback
    async function getAIFeedback(question, userAnswer) {
        // In a real implementation, you would call the DeepSeek API here
        // This is a simulation that returns mock feedback after a delay
        
        return new Promise(resolve => {
            setTimeout(() => {
                const mockFeedback = `
                    <p><strong>Your answer shows good understanding of the topic.</strong> Here's how you could improve:</p>
                    <ul>
                        <li>Try to include more specific examples from your experience</li>
                        <li>Structure your answer using the STAR method (Situation, Task, Action, Result)</li>
                        <li>Focus more on measurable outcomes of your actions</li>
                    </ul>
                    <p>Overall rating: <strong>7/10</strong> - Good start but could be more detailed.</p>
                    <p><em>Note: This is simulated feedback. Real AI feedback would analyze your response more deeply.</em></p>
                `;
                resolve(mockFeedback);
            }, 1500);
        });
    }
    
    // Function to generate PDF from questions
    function generatePdf() {
        const doc = new jsPDF();
        let yPos = 20;
        
        // Add title with blue header
        doc.setFillColor(67, 97, 238);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text(`Interview Preparation for ${position}`, 105, 15, { align: 'center' });
        yPos = 30;
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated based on your resume and experience level: ${document.getElementById('experienceLevel').selectedOptions[0].text}`, 105, yPos, { align: 'center' });
        yPos += 20;
        
        // Add each question category
        const categories = [
            { id: 'technical', title: 'Technical Questions' },
            { id: 'behavioral', title: 'Behavioral Questions' },
            { id: 'situational', title: 'Situational Questions' },
            { id: 'company', title: 'Company-Specific Questions' }
        ];
        
        categories.forEach(category => {
            const questions = allQuestions[category.id];
            
            if (questions.length > 0) {
                // Add category title
                doc.setFontSize(16);
                doc.setTextColor(40, 53, 147);
                doc.text(category.title, 14, yPos);
                yPos += 10;
                
                // Add questions and answers
                doc.setFontSize(12);
                questions.forEach(q => {
                    // Split text into lines that fit the page width
                    const questionLines = doc.splitTextToSize(q.question, 180);
                    const answerLines = doc.splitTextToSize(q.answer, 180);
                    
                    // Add question
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text(questionLines, 14, yPos);
                    yPos += questionLines.length * 7;
                    
                    // Add answer
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    doc.text(answerLines, 14, yPos);
                    yPos += answerLines.length * 7 + 10;
                    
                    // Check if we need a new page
                    if (yPos > 260) {
                        doc.addPage();
                        yPos = 20;
                    }
                });
                
                yPos += 10;
            }
        });
        
        // Save the PDF
        doc.save(`Interview_Prep_${position.replace(/ /g, '_')}.pdf`);
    }
});