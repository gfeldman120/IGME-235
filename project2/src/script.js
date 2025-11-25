// Element variables
let lastDogHolder = document.querySelector("#lastDogHolder");
let listParent = document.querySelector("ul");
let searchButton = document.querySelector("#search");
let numberOfDogs = document.querySelector("#numberOfDogsInput");
let content = document.querySelector("#content");
let checkboxes = [];
let parentBreedindices = [];
let subBreedCounts = [];


// Setting input restrictions
numberOfDogs.min = 1;
numberOfDogs.max = 50;
numberOfDogs.step = 1;
numberOfDogs.placeholder = "Number 1-50";
numberOfDogs.value = "";

// Misc. variables
const breedsURL = "https://dog.ceo/api/breeds/list/all";
const randomDogURL = "https://dog.ceo/api/breeds/image/random";
let searching = false;

// On load, set the corner dog and begin the process of loading the filters
window.onload = () => {
    loadCornerDog();
    fetch(breedsURL)
        .then(response => {
            return response.json();
        })
        .then(data => {
            loadFilters(data);
        })
        .catch(error => {
            console.error("Breeds API error!", error);
            listParent.innerHTML = `
                <li>Something went wrong, please try again later!</li>
                <li>(${error.message})</li>`;
        })
}

// Make the 1st letter of a string uppercase
const upperFirstLowerLast = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

// Either select all checkboxes if true or unselect all checkboxes if false
const selectAll = (value) => {
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = value;
    }
}

// If a parent checkbox is hit, check or uncheck all children (sub breeds)
const parentCheckboxHit = (index, count) => {
    let value = checkboxes[index].checked;
    for (let i = index + 1; i < index + 1 + count; i++) {
        checkboxes[i].checked = value;
    }
}

// If a child checkbox is hit, check other children and change value of parent to match if all children are the same
const childCheckboxHit = (parentIndex, count) => {
    for (let i = 0; i < count; i++) {
        if (checkboxes[parentIndex + 1 + i].checked) {
            checkboxes[parentIndex].checked = true;
            return;
        }
    }
    checkboxes[parentIndex].checked = false;
}

// When the quantity of results is changed, ensure it is valid and attempt to fix it if it isn't
const quantityUpdated = () => {
    let value = numberOfDogs.value;
    if (value > 1 && value <= 50 && !isNaN(value)) {
        searchButton.innerHTML = `Find ${value} dogs of a random breed!`;
    }
    else {
        numberOfDogs.value = 1;
        searchButton.innerHTML = "Find a dog of a random breed!";
    }
}

// Taking API data and strings for the breed/sub breed names, turn them into HTML to be presented to the user
const loadDogs = (data, breed, subBreed) => {
    // Breed name
    let newHTML = `
        <h2 id="breedName">${breed}</h2>
        <div class="line"></div>`;
    // Sub breed name
    if (subBreed != "") {
        newHTML += `
        <h3 id="subBreedName">${subBreed}</h3>
        <div class="line"></div>`;
    }
    // Images
    newHTML += `<div id="dogGrid">`;
    localStorage.setItem("cornerDog", data.message[Math.floor(Math.random() * data.message.length)]);
    for (let i = 0; i < data.message.length; i++) {
        newHTML += `<img src="${data.message[i]}" alt="A dog"></img>`;
    }
    newHTML += `</div>`;
    content.innerHTML = newHTML;
    // Only allow so many columns at once, depending on number of results, to prevent weird grid shapes
    let dogGrid = document.querySelector("#dogGrid");
    dogGrid.style.maxWidth = `calc(300px * ${data.message.length} + 50px)`;
    searching = false;
    window.location.href = "#content";
}

// Load the dog in the corner of the screen via local storage or, if that doesn't exist, attempt to display a random dog image
const loadCornerDog = () => {
    let cornerDog = localStorage.getItem("cornerDog");
    if (cornerDog == null) {
        fetch(randomDogURL)
            .then(response => {
                return response.json();
            })
            .then(data => {
                cornerDog = data.message;
                lastDogHolder.innerHTML = `<img src="${cornerDog}" alt="The last dog viewed" id="savedDog">`
            })
            .catch(error => {
                console.error("Random dog API error!", error);
            })
    }
    else {
        lastDogHolder.innerHTML = `<img src="${cornerDog}" alt="The last dog viewed" id="savedDog">`;
    }
}

// Get a random breed/sub breed from selected checkboxes and search for those dogs
const search = () => {
    if (!searching) {
        searching = true;
        let url = "https://dog.ceo/api/breed/";
        let selectedBreeds = [];
        let lastParent = 0;
        // Going through each selected checkbox - No need to check for selected children under unselected parents, not possible
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                for (let j = 0; j < parentBreedindices.length; j++) {
                    // Parent, needs sub breeds array
                    if (i == parentBreedindices[j]) {
                        lastParent = selectedBreeds.length;
                        selectedBreeds.push({
                            name: checkboxes[i].name,
                            subBreeds: []
                        });
                        break;
                    }
                    // Child, can just be a string
                    else if (i > parentBreedindices[j] && i <= parentBreedindices[j] + subBreedCounts[j]) {
                        selectedBreeds[lastParent].subBreeds.push(checkboxes[i].name);
                        break;
                    }
                    // No sub breeds, still an object with a name
                    else if (i < parentBreedindices[j]) {
                        selectedBreeds.push({
                            name: checkboxes[i].name
                        });
                        break;
                    }
                }
            }
        }
        // If at least 1 breed is selected
        if (selectedBreeds.length > 0) {
            // Select a random breed from those selected and append it to the URL
            let randomIndex = Math.floor(Math.random() * selectedBreeds.length);
            let breed = selectedBreeds[randomIndex];
            url += breed.name;
            let breedName = upperFirstLowerLast(breed.name);
            // If sub breeds are selected, select a random one and append it to the URL
            let subBreedName = "";
            if ("subBreeds" in breed && breed.subBreeds.length > 0) {
                let subBreed = breed.subBreeds[Math.floor(Math.random() * breed.subBreeds.length)];
                url += `/${subBreed}`;
                subBreedName = upperFirstLowerLast(subBreed);
            }
            // Ensuring quantity is valid, only 1 search result otherwise
            let quantity = 1;
            if (!isNaN(numberOfDogs.value) && numberOfDogs.value >= 1 && numberOfDogs.value <= 50) {
                quantity = numberOfDogs.value;
            }
            // Finish the URL, swap the content area to the loading image and use the URL
            url += `/images/random/${quantity}`;
            content.innerHTML = `<img src="src/loading.png" alt="Logo of a dog face, with loading text below it" id="loadingImage"></img>`;
            fetch(url)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    loadDogs(data, breedName, subBreedName);
                })
                .catch(error => {
                    console.error("Search API error!", error);
                    content.innerHTML = `<h1>Something went wrong, please try again later!<br><br>(${error.message})</h1>`;
                    searching = false;
                })
        }
        // If nothing is selected, try again with every breed selected
        else {
            searching = false;
            selectAll(true);
            search();
            selectAll(false);
        }
    }
}

// Once filters are retreived, turn them into checkboxes and add events to elements
const loadFilters = (data) => {
    // Go through each breed and create HTML for each
    let newHTML = "";
    let breeds = Object.keys(data.message);
    let currentIndex = 0;
    for (let i = 0; i < breeds.length; i++) {
        let breedName = breeds[i].toString();
        newHTML += `
            <li>
                <input type="checkbox" id="breed${i}" name="${breedName}" value="${breedName}">
                <label for="breed${i}">${upperFirstLowerLast(breedName)}</label>
            </li>`;
        let subBreeds = data.message[breeds[i]];
        // If a breed has sub breeds, make a 2nd list using HTML and save both the parent breed's index and the number of sub breeds to corresponding arrays
        if (subBreeds.length > 0) {
            parentBreedindices.push(currentIndex);
            subBreedCounts.push(subBreeds.length);
            currentIndex++;
            newHTML += `<ul>`;
            for (let j = 0; j < subBreeds.length; j++) {
                let subBreedName = subBreeds[j].toString();
                newHTML += `
                    <li>
                        <input type="checkbox" id="subBreed${j}:${breedName}" name="${subBreedName}" value="${subBreedName}">
                        <label for="subBreed${j}:${breedName}" class="subBreed">${upperFirstLowerLast(subBreedName)}</label>
                    </li>`;
                currentIndex++;
            }
            newHTML += `</ul>`;
        }
        else {
            currentIndex++;
        }
    }
    listParent.innerHTML = newHTML;
    // Now that checkboxes exist, save them
    checkboxes = document.querySelectorAll("input");
    // Give different elements events to allow for better interaction
    document.querySelector("#selectAll").addEventListener("click", function () { selectAll(true) });
    document.querySelector("#unselectAll").addEventListener("click", function () { selectAll(false) });
    for (let i = 0; i < parentBreedindices.length; i++) {
        checkboxes[parentBreedindices[i]].addEventListener("change", function () { parentCheckboxHit(parentBreedindices[i], subBreedCounts[i]) });
        for (let j = 0; j < subBreedCounts[i]; j++) {
            checkboxes[parentBreedindices[i] + j + 1].addEventListener("change", function () { childCheckboxHit(parentBreedindices[i], subBreedCounts[i]) });
        }
    }
    numberOfDogs.addEventListener("blur", function () { quantityUpdated() });
    searchButton.addEventListener("click", function () { search() });
}