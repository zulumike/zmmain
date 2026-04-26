import * as config from './config.js';
const basicEndpoint = '/api/shoplistdb';

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

// export async function getFoods() {
//     try {
//         const foodsJson = await fetch('https://www.matvaretabellen.no/api/nb/foods.json');
//         const foods = await foodsJson.json();
//         return { status: 200, body: foods.foods }
//     }
//     catch (error) {
//         return { status: 400, body: 'Error fetching foods! ' + error}
//     }

// }

// export async function getFoodCategories() {
//     try {
//         const categoriesJson = await fetch('https://www.matvaretabellen.no/api/nb/food-groups.json');
//         const categories = await categoriesJson.json();
//         let maincategories = {};
//         for (let i = 0; i < categories.foodGroups.length; i++) {
//             const category = categories.foodGroups[i];
//             if (!category.foodGroupId.includes('.')) {
//                 maincategories[category.foodGroupId] = { name: category.name };
//             }
//         }
//         return { status: 200, body: maincategories }
//     }
//     catch (error) {
//         return { status: 400, body: 'Error fetching food categories! ' + error}
//     }
// }


// COSMOS DB FUNCTIONS

export async function readAllItemsDB(container) {
    const endpoint = basicEndpoint + '?containerid=' + container;
    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (response.status === 204) {
            return { status: 204, body: 'No items found' };
        }
        const result = await response.json();
        return { status: 200, body: result };
    }
    catch (error) {
        return { status: 400, body: 'Error getting items from database! ' + error }
    }

}

export async function getAccountByUserDB(container, userDetail) {
    const endpoint = basicEndpoint + '?containerid=' + container +'&userdetail=' + userDetail;

    try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        if (result.length < 1) {
            return { status: 404, body: 'Ingen konto funnet' };
        } else {
            return { status: 200, body: result };
        }
    }
    catch (error) {
        return { status: 400, body: 'Error getting account' + error }
    }
}

export async function getItemDB(container, id) {
  const endpoint = basicEndpoint + '?containerid=' + container +'&id=' + id;

    try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        if (result.length < 1) {
            return { status: 204, body: 'Ingen element funnet' };
        } else {
            return { status: 200, body: result };
        }
    }
    catch (error) {
        return { status: 400, body: 'Error getting item' + error }
    }

}

export async function getAccountStoresDB(container, accountId) {
  const endpoint = basicEndpoint + '?containerid=' + container +'&accountid=' + accountId;

    try {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        if (result.length < 1) {
            return { status: 404, body: 'Ingen butikker funnet' };
        } else {
            return { status: 200, body: result };
        }
    }
    catch (error) {
        return { status: 400, body: 'Error getting item - ' + error }
    }

}

export async function updateItemDB(container, data) {
    // const oldData = await getItemDB(container, data.id);

    const endpoint =   basicEndpoint + '?containerid=' + container + '&id=' + data.id;
    try {
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        return { status: res.status, body: result }
    }
    catch (error) {
        return { status: 400, body: 'Error updating item: ' + error }
    }
}

export async function createItemDB(container, data) {
    const endpoint =  basicEndpoint + '?containerid=' + container;
    
    try {
        if (!data.id) data.id = generateId();
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (response.status !== 200 && response.status !== 201) {
            throw new Error(response.status + '-' + response.body)
        }
        return { status: 201 };
    }
    catch (error) {
        console.error(error);
        return { status: 400, body: 'Error creating item: ' + error }
    }
}

//   Hard delete:
export async function deleteItemDB(container, id) {

    const endpoint =  basicEndpoint + '?containerid=' + container
    const getItemDBResponse = await getItemDB(container, id);
    if (getItemDBResponse.status !== 200) {
        return { status: getItemDBResponse.status, body: getItemDBResponse.body }
    }
    const itemToBeDeleted = getItemDBResponse.body;
        try {
            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemToBeDeleted)
            });
            if (response.status !== 204) {
                throw new Error(response.status + '-' + response.body)
            }
            return { status: 200, body: 'Item successfully deleted' };
        }
        catch (error) {
            return { status: 400, body: 'Error deleting item: ' + error }
        }
}

export async function getLocalSettings() {
    const settingsResponse = await getAllItems(config.shopSettingsContainer);
    if (settingsResponse.status === 200) {
        const settings = settingsResponse.body || {};
        return settings;
    }
    else {
        return {};
    }
}

export async function writeLocalSettings(settings) {
    await addItems(config.shopSettingsContainer, settings);
}

export async function syncToCloud(localContainer, cloudContainer) {
    try {
        const localItemsResponse = await getAllItems(localContainer);
        if (localItemsResponse.status !== 200 && localItemsResponse.status !== 204) {
            console.log('Error getting local items to sync: ' + localItemsResponse.status + ' - ' + localItemsResponse.body);
            throw new Error('Error getting local items to sync: ' + localItemsResponse.body);
        }
        let localItems = [];
        if (localItemsResponse.status !== 204) {
            localItems = localItemsResponse.body;
        }
        const cloudItemsResponse = await readAllItemsDB(cloudContainer);
        if (cloudItemsResponse.status !== 200 && cloudItemsResponse.status !== 204) {
            console.log('Error getting cloud items to sync: ' + cloudItemsResponse.body);
            throw new Error('Error getting cloud items to sync: ' + cloudItemsResponse.body);
        }
        let cloudItems = [];
        if (cloudItemsResponse.status !== 204) {
            cloudItems = cloudItemsResponse.body;
        }
        // Compare local and cloud items and find items that exist locally but not in the cloud, then upload those items to the cloud
        let itemsToUpload = [];
        for (let i = 0; i < localItems.length; i++) {
            const localItem = localItems[i];
            let itemExistInCloud = false;
            for (let j = 0; j < cloudItems.length; j++) {
                const cloudItem = cloudItems[j];
                if (localItem.id === cloudItem.id) {
                    itemExistInCloud = true;
                    break;
                }
            }
            if (!itemExistInCloud) {
                itemsToUpload.push(localItem);
            }
        }
        for (let k = 0; k < itemsToUpload.length; k++) {
            const itemToUpload = itemsToUpload[k];
            const creteItemResponse = await createItemDB(cloudContainer, itemToUpload);
            if (creteItemResponse.status !== 201) {
                console.log('Error uploading item to cloud: ' + creteItemResponse.body);
                throw new Error('Error uploading item to cloud: ' + creteItemResponse.body);
            }
        }
        // compaler local and cloud items and find items that exist in the cloud but not locally, then delete those items from the cloud
        let itemsToDeleteFromCloud = [];
        for (let l = 0; l < cloudItems.length; l++) {
            const cloudItem = cloudItems[l];
            let itemExistLocally = false;
            for (let m = 0; m < localItems.length; m++) {
                const localItem = localItems[m];
                if (cloudItem.id === localItem.id) {
                    itemExistLocally = true;
                    break;
                }
            }
            if (!itemExistLocally) {
                itemsToDeleteFromCloud.push(cloudItem);
            }
        }
        for (let n = 0; n < itemsToDeleteFromCloud.length; n++) {
            const itemToDelete = itemsToDeleteFromCloud[n];
            const deleteItemResponse = await deleteItemDB(cloudContainer, itemToDelete.id);
            if (deleteItemResponse.status !== 200) {
                console.log('Error deleting item from cloud: ' + deleteItemResponse.body);
                throw new Error('Error deleting item from cloud: ' + deleteItemResponse.body);
            }
        } 
        return { status: 200, body: 'Sync to cloud successful. ' + itemsToUpload.length + ' items uploaded' }
    }
    catch (error) {
        console.error(error);
        return { status: 400, body: 'Error syncing to cloud: ' + error }
    }
}

export async function syncToLocal(cloudContainer, localContainer) {
    const cloudItemsResponse = await readAllItemsDB(cloudContainer);
    if (cloudItemsResponse.status === 200) {
        const cloudItems = cloudItemsResponse.body;
        const addItemsResponse = await addItems(localContainer, cloudItems);
        if (addItemsResponse.status === 200) {
            return { status: 200, body: 'Sync to local successful. ' + cloudItems.length + ' items added to local' }
        }
        else {
            console.log('Error adding items to local: ' + addItemsResponse.body);
            return { status: addItemsResponse.status || 400, body: 'Error adding items to local: ' + addItemsResponse.body }
        }
    } else {
        console.log('Error syncing to local: ' + cloudItemsResponse.body);
        return { status: cloudItemsResponse.status || 400, body: 'Error syncing to local: ' + cloudItemsResponse.body }
    }
}