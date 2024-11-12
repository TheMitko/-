document.addEventListener('DOMContentLoaded', function () {
    // Grab the form elements by their IDs
    const playersCntSelect = document.getElementById('PlayersCnt');
    const mapSelect = document.getElementById('Map');
    const pawnsCountInput = document.getElementById('pawns-count');
    const saveButton = document.getElementById('saveButton'); // The button that triggers saving

    // Add a click event listener to the save button
    saveButton.addEventListener('click', function (event) {
        //event.preventDefault(); // Prevent default form behavior (page reload)

        // Get the values from the form elements
        const playersCount = playersCntSelect.value;  // Value from the number of players dropdown
        const mapSelection = mapSelect.value;         // Value from the map dropdown
        const pawnsCount = pawnsCountInput.value;     // Value from the number of pawns input field

        // Now you can save the data, display it, or use it as needed

        // For example, display the saved data in the console:
        console.log('Number of Players:', playersCount);
        console.log('Selected Map:', mapSelection);
        console.log('Number of Pawns:', pawnsCount);

        // Optionally, store the data in a JavaScript object or save it for later
        const savedData = {
            playersCount: playersCount,
            mapSelection: mapSelection,
            pawnsCount: pawnsCount
        };

        // You can store the data in localStorage if you want to persist it across page reloads
        localStorage.setItem('gameData', JSON.stringify(savedData));

        // Optionally, display a confirmation message or the saved data on the page
        alert('Всичко е запазено!');

        if (mapSelection === "1") {
            dynamicLink.href = "game_europe.html";
        } else if (mapSelection === "2") {
            dynamicLink.href = "game_usa.html";
        }
    });
});
