
async function addSingleItemToLS(container, item) {
    const items = JSON.parse(localStorage.getItem(container)) || [];
    items.push(item);
    try {
        localStorage.setItem(container, JSON.stringify(items))
        return { status: 200, body: 'Item added' }
    }
    catch (error) {
        console.log('Error adding item. Error: ' + error)
        return { status: 400, body: 'Error adding item! Error: ' + error }
    }
}

async function addItemsToLS(container, items) {
    try {
        localStorage.setItem(container, JSON.stringify(items));
        return { status: 200, body: items.length + ' items added' }
    }
    catch (error) {
        console.log('Error adding items. Error: ' + error);
        return { status: 400, body: 'Error adding items! Error: ' + error }
    }
}

async function getSingelItemFromLS(container, itemId) {
    try {
        const items = JSON.parse(localStorage.getItem(container)) || [];
        let itemFound = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === itemId) {
                itemFound = true;
                return items[i];
            }
        }
        if (!itemFound) {
            throw new Error('Item not found');
        }
    }
    catch (error) {
        console.log('Error getting item. Error: ' + error);
        return { status: 400, body: 'Error getting item. Error: ' + error}
    }
}

async function getAllItemsFromLS(container) {
    try {
        const items = JSON.parse(localStorage.getItem(container)) || [];
        if (items.length < 1) {
            return { status: 204, body: 'No items in storage'}
        }
    }
    catch (error) {
        console.log('Error getting items! Erro: ' + error);
        return { status: 400, body: 'Error getting items! Erro: ' + error}
    }
}

async function updateItemToLS(container, item) {
    try {
        const items = JSON.parse(localStorage.getItem(container)) || [];
        let itemFound = false
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === item.id) {
                items[i] = item
                itemFound = true;
                break;
            }
        }
        if (!itemFound) {
            throw new Error('Item not found');
        }
        return { status: 200, body: 'Item successfully updated'}
    }
    catch (error) {
        console.log('Error updating item. Error: ' + error)
        return { status: 400, body: 'Error updating item! Error: ' + error}
    }
}

async function deleteItemFromLS(container, itemId) {
    try {
        const items = JSON.parse(localStorage.getItem(container)) || [];
        let itemFound = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id = itemId) {
                items.splice(i, 1);
                itemFound = true;
                break;
            }
        }
        if (!itemFound) {
            throw new Error('Item not found');
        }
        return { status: 200, body: 'Item successfully deleted'}
    }
    catch (error) {
        console.log('Error deleting item! Error: ' + error)
        return { status: 400, body: 'Error deleting item! Error: ' + error}
    }
}

async function deleteAllItemsFromLS(container) {
    try {
        localStorage.removeItem(container);
        return { status: 200, body: 'All items successfully deleted'}
    }
    catch (error) {
        console.log('Error deleting items! Error: ' + error)
        return { status: 400, body: 'Error deleting items! Error: ' + error}
    }
}

export {
    addSingleItemToLS,
    addItemsToLS,
    getSingelItemFromLS,
    getAllItemsFromLS,
    updateItemToLS,
    deleteItemFromLS,
    deleteAllItemsFromLS
}