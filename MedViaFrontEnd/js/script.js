
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('medicineForm');
            const input = document.getElementById('medicineInput');
            const submitBtn = document.getElementById('submitBtn');
            const chatMessagesDiv = document.getElementById('chatMessages');

            
            const API_ENDPOINT = 'https://localhost:7112/api/Med/info'; 

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const medicineName = input.value.trim();

                if (!medicineName) return;

                // 1. Add user message to chat
                addMessage(medicineName, 'user');
                input.value = ''; // Clear input

                // 2. Add loading message
                const loadingMessageElement = addMessage('Looking up the medicine details for you…', 'loading');
                submitBtn.disabled = true; // Disable button during fetch

                try {
                    // 3. Fetch data from the .NET API
                    const response = await fetch(API_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: medicineName }), 
                    });

                    if (!response.ok) {
                        throw new Error(`API call failed with status: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    // 4. Remove loading message and display AI results
                    chatMessagesDiv.removeChild(loadingMessageElement);
                    displayResults(data, medicineName);

                } catch (error) {
                    console.error('Error fetching medicine data:', error);
                    chatMessagesDiv.removeChild(loadingMessageElement); // Remove loading
                    addMessage('An error occurred. Please try again or check the medicine name.', 'error');
                } finally {
                    // 5. Re-enable button
                    submitBtn.disabled = false;
                    scrollToBottom();
                }
            });

            /**
             * Adds a message to the chat interface.
             * @param {string} content - The text content of the message.
             * @param {string} type - 'user', 'loading', or 'error'.
             * @returns {HTMLElement} The created message element.
             */
            function addMessage(content, type) {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message');

                if (type === 'user') {
                    messageDiv.classList.add('user-message');
                    messageDiv.textContent = content;
                } else if (type === 'loading') {
                    messageDiv.classList.add('loading-message');
                    messageDiv.innerHTML = `<div class="spinner"></div> ${content}`;
                } else if (type === 'error') {
                    messageDiv.classList.add('error-message-box');
                    messageDiv.textContent = content;
                }
                
                chatMessagesDiv.appendChild(messageDiv);
                scrollToBottom();
                return messageDiv;
            }

            /**
             
             * @param {Object} data - The medicine information object from the API.
             * @param {string} medicineName - The name of the medicine queried.
             */
            function displayResults(data, medicineName) {
                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.classList.add('message', 'ai-message');

                aiMessageDiv.innerHTML = `
                    <h3 class="heading-text" >Information for: <span style="color: var(--text-color-light);">${medicineName}</span></h3>
                    <div class="info-block">
                        <h4><span class="icon">💡</span> Use Case / Purpose</h4>
                        <p>${data.useCase || 'Information not available for this section.'}</p>
                    </div>

                    <div class="info-block">
                        <h4 class="heading-text"><span class="icon">👥</span> Target Audience</h4>
                        <p>${data.targetAudience || 'Information not available for this section.'}</p>
                    </div>
                    
                    <div class="info-block">
                        <h4 class="heading-text"><span class="icon">🥄</span> Dosage Recommendations</h4>
                        <p>${data.dosageRecommendations || 'Information not available for this section.'}</p>
                    </div>
                    <div class="info-block">
                        <h4 class="heading-text"><span class="icon">⚠️</span> Side Effects</h4>
                        <p>${data.sideEffects || 'Information not available for this section.'}</p>
                    </div>
                    <div class="info-block">
                        <h4 class="heading-text"><span class="icon">🚫</span> Precautions</h4>
                        <p>${data.precautions || 'Information not available for this section.'}</p>
                    </div>
                `;
                
                chatMessagesDiv.appendChild(aiMessageDiv);
                scrollToBottom();
            }

           
            function scrollToBottom() {
                chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
            }

          
            scrollToBottom();
        });