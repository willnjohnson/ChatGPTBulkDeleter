// ==UserScript==
// @name         ChatGPT Bulk Deleter
// @namespace    GreaseMonkey / TamperMonkey
// @version      1.0
// @description  Don't have time to manually delete all of your conversations? ChatGPT Bulk Deleter makes it seamless to delete multiple conversations.
// @author       @willnjohnson
// @match        *://chatgpt.com/*
// @match        *://www.chatgpt.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    let bulkDeleteButton = null;  // global reference

    function waitForSidebarAndInsertButton() {
        const targetNode = document.querySelector('nav');
        if (!targetNode) {
            setTimeout(waitForSidebarAndInsertButton, 1000);
            return;
        }

        if (document.getElementById('bulk-delete-btn')) return;

        bulkDeleteButton = document.createElement('button');
        bulkDeleteButton.innerText = 'Bulk Delete';
        bulkDeleteButton.id = 'bulk-delete-btn';
        bulkDeleteButton.style.position = 'fixed';
        bulkDeleteButton.style.top = '60px';
        bulkDeleteButton.style.right = '25px';
        bulkDeleteButton.style.zIndex = '10000';
        bulkDeleteButton.style.padding = '6px 12px';
        bulkDeleteButton.style.background = '#d33';
        bulkDeleteButton.style.color = '#fff';
        bulkDeleteButton.style.border = 'none';
        bulkDeleteButton.style.borderRadius = '4px';
        bulkDeleteButton.style.cursor = 'pointer';
        bulkDeleteButton.style.fontSize = '14px';

        bulkDeleteButton.onmouseover = () => bulkDeleteButton.style.background = '#b22';
        bulkDeleteButton.onmouseout = () => bulkDeleteButton.style.background = '#d33';

        bulkDeleteButton.onclick = showBulkDeleteModal;

        document.body.appendChild(bulkDeleteButton);
    }

    async function getAuthToken() {
        try {
            const res = await fetch('https://chatgpt.com/api/auth/session', {
                credentials: 'include'
            });
            const data = await res.json();
            return data?.accessToken;
        } catch (e) {
            console.error('Failed to get auth token', e);
            return null;
        }
    }

    function showBulkDeleteModal() {
        // Push Bulk Delete button behind overlay & disable pointer events
        if (bulkDeleteButton) {
            bulkDeleteButton.style.zIndex = '0';
            bulkDeleteButton.style.pointerEvents = 'none';
        }

        const links = Array.from(document.querySelectorAll('a[href^="/c/"]'));
        const uniqueLinks = Array.from(new Set(links.map(a => a.href)));

        const overlay = document.createElement('div');
        overlay.id = 'modalOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0, 0, 0, 0.6)';
        overlay.style.zIndex = '9998';
        document.body.appendChild(overlay);

        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = '#181818';
        modal.style.color = '#fff';
        modal.style.padding = '20px';
        modal.style.border = '2px solid #888';
        modal.style.borderRadius = '8px';
        modal.style.zIndex = '9999';
        modal.style.maxHeight = '80vh';
        modal.style.overflowY = 'auto';
        modal.style.boxShadow = '0 0 15px rgba(0,0,0,0.8)';
        modal.style.width = '600px';
        modal.id = 'bulk-delete-modal';

        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.borderBottom = '1px solid #444';
        headerContainer.style.marginBottom = '10px';

        const header = document.createElement('h2');
        header.innerText = 'Conversations';
        header.style.margin = '0';
        header.style.fontSize = '18px';

        const btnX = document.createElement('button');
        btnX.innerText = '✕';
        btnX.style.background = 'transparent';
        btnX.style.border = 'none';
        btnX.style.color = '#aaa';
        btnX.style.fontSize = '18px';
        btnX.style.cursor = 'pointer';
        btnX.style.padding = '0 6px';

        btnX.onmouseover = () => btnX.style.color = '#fff';
        btnX.onmouseout = () => btnX.style.color = '#aaa';

        function closeModal() {
            modal.remove();
            overlay.remove();

            // Restore Bulk Delete button styles to be visible and clickable
            if (bulkDeleteButton) {
                bulkDeleteButton.style.zIndex = '10000';
                bulkDeleteButton.style.pointerEvents = 'auto';
            }
        }

        btnX.onclick = closeModal;
        overlay.onclick = closeModal;

        const escListener = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escListener);
            }
        };
        document.addEventListener('keydown', escListener);

        headerContainer.appendChild(header);
        headerContainer.appendChild(btnX);
        modal.appendChild(headerContainer);

        const listContainer = document.createElement('div');
        listContainer.style.maxHeight = '50vh';
        listContainer.style.overflowY = 'auto';
        listContainer.style.marginBottom = '10px';

        uniqueLinks.forEach(href => {
            const anchor = links.find(a => a.href === href);
            const chatName = anchor.querySelector('span')?.innerText?.trim() || '[Unnamed Chat]';
            const id = href.split('/c/')[1];
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = id;
            checkbox.style.marginRight = '8px';

            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.margin = '5px 0';
            label.style.padding = '4px 12px';
            label.style.cursor = 'pointer';
            label.style.color = '#ddd';
            label.style.borderRadius = '4px';

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(chatName));

            listContainer.appendChild(label);
        });

        const buttonRow = document.createElement('div');
        buttonRow.style.display = 'flex';
        buttonRow.style.justifyContent = 'center';
        buttonRow.style.gap = '10px';
        buttonRow.style.paddingTop = '10px';
        buttonRow.style.borderTop = '1px solid #444';
        buttonRow.style.background = '#181818';
        buttonRow.style.position = 'sticky';
        buttonRow.style.bottom = '0';

        const btnDelete = document.createElement('button');
        btnDelete.innerText = 'Delete Checked';
        btnDelete.style.background = '#e53935';
        btnDelete.style.color = '#fff';
        btnDelete.style.border = 'none';
        btnDelete.style.padding = '6px 12px';
        btnDelete.style.borderRadius = '4px';
        btnDelete.style.cursor = 'pointer';

        btnDelete.onmouseover = () => btnDelete.style.background = '#c62828';
        btnDelete.onmouseout = () => btnDelete.style.background = '#e53935';

        btnDelete.onclick = async () => {
            const token = await getAuthToken();
            if (!token) {
                alert('Auth token missing — are you logged in?');
                return;
            }

            const checked = listContainer.querySelectorAll('input:checked');
            for (const box of checked) {
                await deleteChat(box.value, token);
                box.closest('label')?.remove();
            }
            updateCheckAllButton();
        };

        const btnCheckAll = document.createElement('button');
        btnCheckAll.innerText = 'Check All';
        btnCheckAll.style.background = '#2196f3';
        btnCheckAll.style.color = '#fff';
        btnCheckAll.style.border = 'none';
        btnCheckAll.style.padding = '6px 12px';
        btnCheckAll.style.borderRadius = '4px';
        btnCheckAll.style.cursor = 'pointer';

        btnCheckAll.onmouseover = () => btnCheckAll.style.background = '#1976d2';
        btnCheckAll.onmouseout = () => btnCheckAll.style.background = '#2196f3';

        // Update button label based on checkbox states
        function updateCheckAllButton() {
            const checkboxes = listContainer.querySelectorAll('input[type="checkbox"]');
            if (checkboxes.length === 0) {
                btnCheckAll.innerText = 'Check All';
                btnCheckAll.disabled = true;
                btnCheckAll.style.opacity = '0.5';
                return;
            } else {
                btnCheckAll.disabled = false;
                btnCheckAll.style.opacity = '1';
            }
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            btnCheckAll.innerText = allChecked ? 'Uncheck All' : 'Check All';
        }

        // Toggle check/uncheck all on button click
        btnCheckAll.onclick = () => {
            const checkboxes = listContainer.querySelectorAll('input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => cb.checked = !allChecked);
            updateCheckAllButton();
        };

        // Also update button label if user manually toggles checkboxes
        listContainer.addEventListener('change', (e) => {
            if (e.target && e.target.type === 'checkbox') {
                updateCheckAllButton();
            }
        });

        buttonRow.appendChild(btnDelete);
        buttonRow.appendChild(btnCheckAll);
        modal.appendChild(listContainer);
        modal.appendChild(buttonRow);
        document.body.appendChild(modal);

        updateCheckAllButton(); // Initial update
    }

    async function deleteChat(convoID, token) {
        try {
            const res = await fetch(`https://chatgpt.com/backend-api/conversation/${convoID}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_visible: false })
            });

            if (res.ok) {
                console.log(`Deleted: ${convoID}`);
                document.querySelector(`a[href="/c/${convoID}"]`)?.remove();
            } else {
                console.warn(`Failed to delete ${convoID}:`, res.status);
            }
        } catch (err) {
            console.error(`Error deleting ${convoID}:`, err);
        }
    }

    waitForSidebarAndInsertButton();
})();
