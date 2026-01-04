
function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

export async function addSingleItem(container, item) {
    const items = JSON.parse(localStorage.getItem(container)) || [];
    if (item.id === undefined) {
        item.id = generateId();
    }
    items.push(item);
    try {
        localStorage.setItem(container, JSON.stringify(items))
        return { status: 200, body: 'Item added' }
    }
    catch (error) {
        return { status: 400, body: 'Error adding item! ' + error }
    }
}

export async function addItems(container, items) {
    try {
        localStorage.setItem(container, JSON.stringify(items));
        return { status: 200, body: items.length + ' items added' }
    }
    catch (error) {
        return { status: 400, body: 'Error adding items! ' + error }
    }
}

export async function getSingleItem(container, itemId) {
    try {
        const items = JSON.parse(localStorage.getItem(container)) || [];
        
        let itemFound = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === itemId) {
                itemFound = true;
                return { status: 200, body: items[i] };
            }
        }
        if (!itemFound) {
            return { status: 404, body: 'Item not found' };
        }
    }
    catch (error) {
        return { status: 400, body: 'Error getting item. ' + error}
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
        return { status: 400, body: 'Error getting items! ' + error}
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
            return { status: 404, body: 'Item not found' };
        }
        localStorage.setItem(container, JSON.stringify(items))
        return { status: 200, body: 'Item successfully updated'}
    }
    catch (error) {
        return { status: 400, body: 'Error updating item! ' + error}
    }
}

export async function deleteItem(container, itemId) {
    try {
        const items = await JSON.parse(localStorage.getItem(container));
        let itemFound = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === itemId) {
                items.splice(i, 1);
                itemFound = true;
                break;
            }
        }
        if (!itemFound) {
            throw new Error('Item not found');
        }
        localStorage.setItem(container, JSON.stringify(items))
        return { status: 200, body: 'Item successfully deleted'}
    }
    catch (error) {
        return { status: 400, body: 'Error deleting item! ' + error}
    }
}

export async function deleteAllItems(container) {
    try {
        localStorage.removeItem(container);
        return { status: 200, body: 'All items successfully deleted'}
    }
    catch (error) {
        return { status: 400, body: 'Error deleting items! ' + error}
    }
}

export async function clearDatabase() {
    try {
        localStorage.clear();
        return { status: 200, body: 'Database cleared'}
    }
    catch (error) {
        return { status: 400, body: 'Error clearing database! ' + error}
    }
}

export async function getFoods() {
    try {
        const foodsJson = await fetch('https://www.matvaretabellen.no/api/nb/foods.json');
        const foods = await foodsJson.json();
        return { status: 200, body: foods.foods }
    }
    catch (error) {
        return { status: 400, body: 'Error fetching foods! ' + error}
    }

}

export async function getFoodCategories() {
    try {
        const categoriesJson = await fetch('https://www.matvaretabellen.no/api/nb/food-groups.json');
        const categories = await categoriesJson.json();
        let maincategories = {};
        for (let i = 0; i < categories.foodGroups.length; i++) {
            const category = categories.foodGroups[i];
            if (!category.foodGroupId.includes('.')) {
                maincategories[category.foodGroupId] = { name: category.name };
            }
        }
        return { status: 200, body: maincategories }
    }
    catch (error) {
        return { status: 400, body: 'Error fetching food categories! ' + error}
    }
}