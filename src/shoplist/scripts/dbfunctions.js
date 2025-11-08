
export async function addSingleItem(container, item) {
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

export async function addItems(container, items) {
    try {
        localStorage.setItem(container, JSON.stringify(items));
        return { status: 200, body: items.length + ' items added' }
    }
    catch (error) {
        console.log('Error adding items. Error: ' + error);
        return { status: 400, body: 'Error adding items! Error: ' + error }
    }
}

export async function getSingleItem(container, itemId) {
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

export async function getAllItems(container) {
    try {
        const items = JSON.parse(localStorage.getItem(container)) || [];
        if (items.length < 1) {
            return { status: 204, body: 'No items in storage'}
        }
        return { status: 200, body: items }
    }
    catch (error) {
        console.log('Error getting items! Erro: ' + error);
        return { status: 400, body: 'Error getting items! Erro: ' + error}
    }
}

export async function updateItem(container, item) {
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

export async function deleteItem(container, itemId) {
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

export async function deleteAllItems(container) {
    try {
        localStorage.removeItem(container);
        return { status: 200, body: 'All items successfully deleted'}
    }
    catch (error) {
        console.log('Error deleting items! Error: ' + error)
        return { status: 400, body: 'Error deleting items! Error: ' + error}
    }
}