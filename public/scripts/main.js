class Main {
    constructor() {
        this.pageClicksKey = 'pageClicksCount';
        this.initializeCounter();
        this.displayCount();
    }

    initializeCounter() {
        if (!localStorage.getItem(this.pageClicksKey)) {
            localStorage.setItem(this.pageClicksKey, '0');
        }
    }

    incrementCount() {
        let currentCount = parseInt(localStorage.getItem(this.pageClicksKey));
        currentCount++;
        localStorage.setItem(this.pageViewsKey, currentCount.toString());
        this.displayCount();
    }

    displayCount() {
        // Update count in div id count
        document.getElementById('count').innerHTML = 'You have clicked this page ' + localStorage.getItem(this.pageClicksKey)  + ' times.'
    }
}

document.addEventListener('click', (event) => {
    this.incrementCount();
});

document.getElementById("section3").addEventListener('dblclick', (event) => {
    alert("NONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONONO");
});

document.getElementById("thisisauniqueid").addEventListener('click', (event) => {
    alert("STOP STOP STOP STOP");
});

// Note that we construct the class here, but we don't need to assign it to a variable.
document.mainClass = new Main();
