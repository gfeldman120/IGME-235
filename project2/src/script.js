const breedsURL = "https://dog.ceo/api/breeds/list/all";
const randomDogURL = `https://dog.ceo/api/breed/${"breed"}/images/random`;
const randomDogSubBreedURL = `https://dog.ceo/api/breed/${"breed"}/${"subBreed"}/images/random`;

window.onload = () => {
    fetch(breedsURL)
        .then(response => {
            return response.json();
        })
        .then(data => {
            LoadFilters(data);
        })
        .catch(error => {
            console.error("Breeds API error!", error);
        })
}

// Variables
let checkboxes = [];
let parentBreedindices = [];
let subBreedCounts = [];
let searchButton = document.querySelector("#search");
let numberOfDogs = document.querySelector("#numberOfDogsInput");
let lastValidNumberOfDogs = 1;

numberOfDogs.min = 1;
numberOfDogs.max = 50;
numberOfDogs.step = 1;
numberOfDogs.placeholder = "Number 1-50";
numberOfDogs.value = "";

const SelectAll = (value) => {
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = value;
    }
}

const ParentCheckboxHit = (index, count) => {
    let value = checkboxes[index].checked;
    for (let i = index + 1; i < index + 1 + count; i++) {
        checkboxes[i].checked = value;
    }
}

const ChildCheckboxHit = (parentIndex, count) => {
    for (let i = 0; i < count; i++) {
        if (checkboxes[parentIndex + 1 + i].checked) {
            checkboxes[parentIndex].checked = true;
            return;
        }
    }
    checkboxes[parentIndex].checked = false;
}

const QuantityUpdated = () => {
    let value = numberOfDogs.value;
    lastValidNumberOfDogs = value;
    if (value > 1 && value <= 50 && !isNaN(value)) {
        search.innerHTML = `Find ${value} dogs!`;
    }
    else {
        numberOfDogs.value = 1;
        search.innerHTML = "Find a dog!";
    }
}

// NEED TO DO
// Fill out LoadingDogs()
// Fill out LoadDogs()
// Change HTML page to blank text

const LoadingDogs = () => {

}

const LoadDogs = (data) => {
    console.log(data);
}

const Search = () => {
    let url = "https://dog.ceo/api/breed/";
    let selectedBreeds = [];
    let lastParent = 0;
    for (let i = 0; i < checkboxes.length; i++) {
        if(checkboxes[i].checked) {
            for (let j = 0; j < parentBreedindices.length; j++) {
                if (i == parentBreedindices[j]) {
                    // Parent
                    lastParent = selectedBreeds.length;
                    selectedBreeds.push({
                        name: checkboxes[i].name,
                        subBreeds: []
                    });
                    break;
                }
                else if (i > parentBreedindices[j] && i <= parentBreedindices[j] + subBreedCounts[j]) {
                    // Child
                    selectedBreeds[lastParent].subBreeds.push(checkboxes[i].name);
                    break;
                }
                else if (i < parentBreedindices[j])
                {
                    // Unique
                    selectedBreeds.push({
                        name: checkboxes[i].name
                    });
                    break;
                }
            }
        }
    }
    if (selectedBreeds.length > 0) {
        let randomIndex = Math.floor(Math.random() * selectedBreeds.length);
        let breed = selectedBreeds[randomIndex];
        url += breed.name;
        if ("subBreeds" in breed) {
            url += `/${breed.subBreeds[Math.floor(Math.random() * breed.subBreeds.length)]}`;
        }
        let quantity = 1;
        if (isNaN(numberOfDogs.value) && numberOfDogs.value >= 1 && numberOfDogs.value <= 50) {
            quantity = numberOfDogs.value;
        }
        url += `/images/random/${quantity}`;
        LoadingDogs();
        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                LoadDogs(data);
            })
            .catch(error => {
                console.error("Search API error!", error);
            })
    }
    else {
        console.log("Nothing is selected - Random dog!");
        SelectAll(true);
        Search();
        SelectAll(false);
    }
}

const LoadFilters = (data) => {
    let newHTML = "";
    let breeds = Object.keys(data.message);
    let currentIndex = 0;
    for (let i = 0; i < breeds.length; i++) {
        let breedName = breeds[i].toString();
        newHTML += `
            <li>
                <input type="checkbox" id="breed${i}" name="${breedName}" value="${breedName}">
                <label for="breed${i}">${breedName.charAt(0).toUpperCase() + breedName.slice(1)}</label>
            </li>`;
        let subBreeds = data.message[breeds[i]];
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
                        <label for="subBreed${j}:${breedName}" class="subBreed">${subBreedName.charAt(0).toUpperCase() + subBreedName.slice(1)}</label>
                    </li>`;
                currentIndex++;
            }
            newHTML += `</ul>`;
        }
        else {
            currentIndex++;
        }
    }
    let listParent = document.querySelector("ul");
    listParent.innerHTML = newHTML;
    // Getting elements
    checkboxes = document.querySelectorAll("input");
    // Setting events
    document.querySelector("#selectAll").addEventListener("click", function () { SelectAll(true) });
    document.querySelector("#unselectAll").addEventListener("click", function () { SelectAll(false) });
    for (let i = 0; i < parentBreedindices.length; i++) {
        checkboxes[parentBreedindices[i]].addEventListener("change", function () { ParentCheckboxHit(parentBreedindices[i], subBreedCounts[i]) });
        for (let j = 0; j < subBreedCounts[i]; j++) {
            checkboxes[parentBreedindices[i] + j + 1].addEventListener("change", function () { ChildCheckboxHit(parentBreedindices[i], subBreedCounts[i]) });
        }
    }
    numberOfDogs.addEventListener("change", function () { QuantityUpdated() });
    document.querySelector("#search").addEventListener("click", function() { Search() });
}