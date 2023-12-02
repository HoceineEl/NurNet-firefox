// Declare a variable to store the blocked websites
let blockedWebsites = null;
let fetchedWebsites = null;
const links = ["https://youtu.be/daKRAN7HQLw?si=hqDvUC3dL0Zu6gGW",
    "https://youtube.com/shorts/JhnwACk7VEU?si=ypo6lOFKbJ9Xg2JF",
    "https://youtube.com/shorts/AqmlDbtBysM?si=C_POdysQUnPS1S6b",
    "https://www.youtube.com/watch?v=sD0YHxAc4mA",
    " https://youtu.be/swhjXT7CD9o?si=JuVg2wSvc3ROSD8Q",
    "https://youtu.be/0zdChdEc73M?si=2Rk4bHNMQxwUuxYy",
    "https://youtu.be/__Zb-bU0zO0?si=NUKi5gUJSqwVMhYc",
    "https://www.youtube.com/watch?v=uywNwKtCYVs",
    "https://www.youtube.com/watch?v=2u5OlVDnMPA",
    "https://www.youtube.com/watch?v=_HKI4GPhU_A",
    "https://youtube.com/shorts/q9fGUEdpjvg?si=dTH4mLwL9hUTBoGa",
    "https://www.youtube.com/shorts/DSUjK5IlwuE",
    "https://www.youtube.com/watch?v=netwWxW8PAI",
    "https://youtu.be/stqOYOPqvKI?si=fJKQeYuso3AMIcGO]"]
// Define a function to fetch the blocked websites from a URL
async function fetchBlockedWebsites(blocklistURL) {
    try {
        let response;

        // Check if the URL is a local resource
        if (blocklistURL.startsWith('local://')) {
            // Fetch the resource locally
            const resourceName = blocklistURL.replace('local://', '');
            response = await fetch(browser.runtime.getURL(resourceName));
        } else {
            // Fetch the resource from an external URL
            response = await fetch(blocklistURL);
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${blocklistURL}`);
        }

        let data = await response.text();
        // Split the data by lines
        const websiteNames = data.split("\n").map((line) => {
            // Remove leading and trailing whitespaces
            return line.trim();
        }).filter(Boolean);

        return websiteNames;
    } catch (error) {
        console.error(error);
        return [];
    }
}
browser.alarms.create("myAlarm", {
    periodInMinutes: 0.3
});
browser.alarms.onAlarm.addListener((alarm) => {
    console.log("another alarm ")
    if (alarm.name === "myAlarm") {
        console.log("MyAlarm ")
        init()
    }
});

async function fetchCustomBlockedWebsites() {
    return new Promise((resolve, reject) => {
        browser.storage.local.get("custom_urls", (data) => {
            try {
                const customUrls = data["custom_urls"] || [];
                resolve(customUrls);
            } catch (error) {
                console.error(error);
                reject([]);
            }
        });
    });
}


async function fetchFirstTime() {
    const blocklistURL = "local://list1.txt";

    const blockedWebsites = await fetchBlockedWebsites(blocklistURL);


    browser.tabs.onUpdated.removeListener(checkwebsite);
    browser.storage.local.set({ "fetched_urls": blockedWebsites }, () => {
        // Call the init function after updating the storage
        init();
    });
}

async function init() {
    fetchedWebsites = await new Promise((resolve) => {
        browser.storage.local.get("fetched_urls", (data) => {
            resolve(data["fetched_urls"] || []);
        });
    });

    // Add onUpdated listener
    browser.tabs.onUpdated.addListener(checkwebsite);

    // Log the current blocked websites for debugging
    console.log("Blocked Websites:", fetchedWebsites);
}

async function checkwebsite(tabId, changeInfo, tab) {
    blockedWebsites = fetchedWebsites.concat(await fetchCustomBlockedWebsites());

    if (changeInfo.url) {
        let hostname = new URL(changeInfo.url).hostname;
        hostname = hostname.replace(/^www\./, '');

        // Ensure case-sensitive comparison and exact match
        if (blockedWebsites.includes(hostname)) {
            browser.tabs.remove(tabId);
            browser.tabs.create({ url: getRandomLink() });
        }
    }
}
// Call the init function

// browser.runtime.onInstalled.addListener(async details => {
//     console.log("installed ")
//     await fetchFirstTime();

// });

// browser.runtime.onRestartRequired.addListener(async () => {
//     console.log("onRestartRequired ")
//     await fetchFirstTime();
// });
// browser.runtime.onStartup.addListener(async () => {
//     console.log("onStartup ")
//     await fetchFirstTime();
// });


function getRandomLink() {
    return links[Math.floor(Math.random() * links.length)];
}
fetchFirstTime();