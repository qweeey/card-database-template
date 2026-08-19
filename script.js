// ============================================
// GET HTML ELEMENTS
// ============================================

const searchBar =
    document.querySelector(".searchBar");


const cardRow =
    document.getElementById("cardRow");


const noResults =
    document.getElementById("noResults");


const totalCardCount =
    document.getElementById("totalCardCount");


const filterButtons =
    document.querySelectorAll(".filter-button");


const setFilterButtons =
    document.querySelectorAll(".set-filter-button");


const collectionFilterButtons =
    document.querySelectorAll(".collection-filter-button");




// ============================================
// VARIABLES
// ============================================

let allCards = [];


let activeFilter = "All";


let activeSet = "All";


let collectionFilter = "all";




// ============================================
// LOAD CARDS FROM CSV
// ============================================

fetch("riftbound/cards.csv")

    .then((response) => response.text())

    .then((csvText) => {

        allCards = parseCSV(csvText);

        renderCards();

        updateTotalCardCount();

    })

    .catch((error) => {

        console.error(
            "Error loading CSV:",
            error
        );

    });




// ============================================
// READ CSV
// ============================================

function parseCSV(csvText) {

    const lines =
        csvText.trim().split("\n");


    const headers =
        lines[0]
            .split(",")
            .map(
                (header) => header.trim()
            );


    return lines
        .slice(1)
        .map((line) => {


            const values =
                line.split(",");


            const card = {};


            headers.forEach(
                (header, index) => {

                    card[header] =
                        values[index]?.trim() || "";

                }
            );


            card.altArt =
                (card.altArt || "false")
                    .toLowerCase() === "true";


            card.overnumbered =
                (card.overnumbered || "false")
                    .toLowerCase() === "true";


            return card;

        });

}




// ============================================
// UNIQUE CARD ID
// ============================================
//
// We use the image filename because every version
// of a card should already have a unique image.
//
// Example:
//
// baccai-sandspinner-ven.avif
// ahri-ven.avif
// ahri-ven-a.avif
//
// ============================================

function getCardId(card) {

    return card.image;

}




// ============================================
// LOAD COLLECTION
// ============================================

function getCollection() {

    const savedCollection =
        localStorage.getItem(
            "riftboundCollection"
        );


    if (!savedCollection) {

        return {};

    }


    return JSON.parse(
        savedCollection
    );

}




// ============================================
// SAVE COLLECTION
// ============================================

function saveCollection(collection) {

    localStorage.setItem(
        "riftboundCollection",
        JSON.stringify(collection)
    );

}




// ============================================
// GET QUANTITY
// ============================================

function getQuantity(card) {

    const collection =
        getCollection();


    const cardId =
        getCardId(card);


    return collection[cardId] || 0;

}




// ============================================
// CHANGE QUANTITY
// ============================================

function changeQuantity(cardId, amount) {

    const collection =
        getCollection();


    let currentQuantity =
        collection[cardId] || 0;


    currentQuantity += amount;


    // Never allow quantities below zero

    if (currentQuantity < 0) {

        currentQuantity = 0;

    }


    // If quantity becomes zero,
    // remove the card from localStorage

    if (currentQuantity === 0) {

        delete collection[cardId];

    }

    else {

        collection[cardId] =
            currentQuantity;

    }


    saveCollection(collection);


    renderCards();


    updateTotalCardCount();

}




// ============================================
// RENDER CARDS
// ============================================

function renderCards() {

    const searchText =
        searchBar.value
            .toLowerCase()
            .trim();



    const filteredCards =
        allCards.filter((card) => {


            // -----------------------------
            // TYPE FILTER
            // -----------------------------

            const matchesType =

                activeFilter === "All"

                ||

                card.type
                    .toLowerCase() ===
                    activeFilter
                        .toLowerCase();



            // -----------------------------
            // SET FILTER
            // -----------------------------

            const matchesSet =

                activeSet === "All"

                ||

                card.set
                    .toLowerCase() ===
                    activeSet
                        .toLowerCase();



            // -----------------------------
            // SEARCH FILTER
            // -----------------------------

            const searchableText = `

                ${card.name}

                ${card.set}

                ${card.type}

                ${card.color}

                ${
                    card.altArt
                        ? "alt art"
                        : ""
                }

                ${
                    card.overnumbered
                        ? "overnumbered"
                        : ""
                }

            `.toLowerCase();



            const matchesSearch =

                searchText === ""

                ||

                searchableText.includes(
                    searchText
                );



            // -----------------------------
            // COLLECTION FILTER
            // -----------------------------

            const quantity =
                getQuantity(card);


            const matchesCollection =

                collectionFilter === "all"

                ||

                quantity > 0;



            return (

                matchesType

                &&

                matchesSet

                &&

                matchesSearch

                &&

                matchesCollection

            );

        });



    const sortedCards =
        sortCards(filteredCards);



    // No cards found

    if (sortedCards.length === 0) {

        cardRow.innerHTML = "";

        noResults.style.display =
            "block";

        return;

    }



    noResults.style.display =
        "none";



    // ============================================
    // GENERATE CARD HTML
    // ============================================

    cardRow.innerHTML =
        sortedCards
            .map((card) => {


                const quantity =
                    getQuantity(card);


                const cardId =
                    getCardId(card);


                const flags = [];


                if (card.altArt) {

                    flags.push(
                        "Alt Art"
                    );

                }


                if (card.overnumbered) {

                    flags.push(
                        "Overnumbered"
                    );

                }



                return `

                    <div
                        class="
                            col-6
                            col-md-4
                            col-lg-3
                            card-wrapper
                        "
                    >


                        <!-- CARD IMAGE -->

                        <div class="card-custom">

                            <img

                                src="
                                    riftbound-images/${card.image}
                                "

                                class="
                                    card-img
                                    ${
                                        card.type
                                            .toLowerCase()
                                            ===
                                            "battlefield"

                                        ?

                                        "rotate-90"

                                        :

                                        ""
                                    }
                                "

                                alt="${card.name}"

                            >

                        </div>



                        <!-- CARD INFORMATION -->

                        <div class="card-caption">


                            <strong>

                                ${card.name}

                            </strong>


                            <br>


                            Set:

                            ${card.set}


                            <br>


                            Type:

                            ${card.type}


                            ${
                                flags.length

                                ?

                                `<br>${flags.join(" | ")}`

                                :

                                ""
                            }



                            <!-- QUANTITY CONTROLS -->

                            <div
                                class="
                                    quantity-controls
                                    mt-3
                                "
                            >


                                <button

                                    class="
                                        btn
                                        btn-outline-danger
                                        quantity-button
                                    "

                                    onclick="
                                        changeQuantity(
                                            '${cardId}',
                                            -1
                                        )
                                    "
                                >

                                    −

                                </button>



                                <span
                                    class="
                                        quantity-number
                                    "
                                >

                                    ${quantity}

                                </span>



                                <button

                                    class="
                                        btn
                                        btn-outline-success
                                        quantity-button
                                    "

                                    onclick="
                                        changeQuantity(
                                            '${cardId}',
                                            1
                                        )
                                    "
                                >

                                    +

                                </button>


                            </div>


                        </div>


                    </div>

                `;

            })

            .join("");

}




// ============================================
// SORT CARDS
// ============================================

function sortCards(cards) {


    const typePriority = {

        unit: 1,

        spell: 2,

        legend: 3,

        rune: 4,

        gear: 5,

        battlefield: 6,

        token: 7

    };


    return [...cards].sort(
        (a, b) => {


            // -----------------------------
            // SORT BY SET
            // -----------------------------

            const setA =
                a.set.toLowerCase();


            const setB =
                b.set.toLowerCase();


            if (setA !== setB) {

                return setA.localeCompare(
                    setB
                );

            }



            // -----------------------------
            // SORT BY COLOR
            // -----------------------------

            const colorA =

                (a.color || "")

                    .split("&")[0]

                    .trim()

                    .toLowerCase();



            const colorB =

                (b.color || "")

                    .split("&")[0]

                    .trim()

                    .toLowerCase();



            if (colorA !== colorB) {

                return colorA.localeCompare(
                    colorB
                );

            }



            // -----------------------------
            // SORT BY TYPE
            // -----------------------------

            const typeA =
                a.type.toLowerCase();


            const typeB =
                b.type.toLowerCase();


            const priorityA =
                typePriority[typeA] ?? 99;


            const priorityB =
                typePriority[typeB] ?? 99;


            if (
                priorityA !== priorityB
            ) {

                return (
                    priorityA -
                    priorityB
                );

            }



            // -----------------------------
            // SORT BY NAME
            // -----------------------------

            return a.name.localeCompare(
                b.name
            );

        }
    );

}




// ============================================
// TOTAL NUMBER OF CARDS OWNED
// ============================================

function updateTotalCardCount() {

    const collection =
        getCollection();


    const total =
        Object.values(
            collection
        )
        .reduce(

            (sum, quantity) => {

                return (
                    sum +
                    quantity
                );

            },

            0

        );


    totalCardCount.textContent =
        `Cards Owned: ${total}`;

}




// ============================================
// SEARCH BAR
// ============================================

searchBar.addEventListener(
    "input",
    () => {

        renderCards();

    }
);




// ============================================
// TYPE FILTER
// ============================================

filterButtons.forEach(
    (button) => {


        button.addEventListener(
            "click",
            () => {


                filterButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                activeFilter =
                    button.getAttribute(
                        "data-filter"
                    );


                renderCards();

            }
        );

    }
);




// ============================================
// SET FILTER
// ============================================

setFilterButtons.forEach(
    (button) => {


        button.addEventListener(
            "click",
            () => {


                setFilterButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                activeSet =
                    button.getAttribute(
                        "data-set"
                    );


                renderCards();

            }
        );

    }
);




// ============================================
// COLLECTION FILTER
// ============================================

collectionFilterButtons.forEach(
    (button) => {


        button.addEventListener(
            "click",
            () => {


                collectionFilterButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active"
                        );


                        btn.classList.remove(
                            "btn-dark"
                        );


                        btn.classList.add(
                            "btn-outline-dark"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                button.classList.remove(
                    "btn-outline-dark"
                );


                button.classList.add(
                    "btn-dark"
                );


                collectionFilter =
                    button.getAttribute(
                        "data-collection"
                    );


                renderCards();

            }
        );

    }
);