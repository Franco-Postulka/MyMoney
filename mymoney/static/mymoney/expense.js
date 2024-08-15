document.addEventListener('DOMContentLoaded',function(){
    list_expenses();
    document.querySelector('#list').addEventListener('click', () => list_expenses());
    document.querySelector('#add').addEventListener('click', () => load_section('add'));
    document.querySelector('#analysis').addEventListener('click', () => load_section('analysis'));
})

function load_section(section){
    hide_all_sections();
    document.querySelector(`#${section}-div`).style.display = 'block';
}

function hide_all_sections(){
    document.querySelector('#list-div').style.display = 'none';
    document.querySelector('#add-div').style.display = 'none';
    document.querySelector('#analysis-div').style.display = 'none';
}

function list_expenses(){
    load_section('list');

    fetch('/mymoney/list')
    .then(response => response.json())
    .then(data => {
        try {
            if (data.length > 0) {
                console.log(data);
                data.forEach(expense => {
                    expense_div = document.createElement('div');
                    expense_div.className = 'expense-div'; 
                    expense_div.setAttribute("id", `${expense.id}`);

                    //Amount of the expense
                    amount_div = document.createElement('div');
                    amount_div.innerHTML = `$${expense.amount.toLocaleString()} `
                    amount_div.className = 'amount-div'
                    expense_div.append(amount_div);

                    //Category of the expense
                    if (expense.category === null){
                        category_div = document.createElement('div');
                        category_div.innerHTML = 'No category'
                    }else{
                        category_div = document.createElement('div');
                        category_div.innerHTML = `${expense.category}`;
                    }
                    category_div.className = 'category-div'
                    expense_div.append(category_div);

                    //Pyment method of the expense
                    if (expense.payment_method === null){
                        payment_div = document.createElement('div');
                        payment_div.innerHTML = 'No payment method'
                    }else{
                        payment_div = document.createElement('div');
                        payment_div.innerHTML = `${expense.payment_method}`;
                    }
                    payment_div.className= 'payment-div'
                    expense_div.append(payment_div);

                    //Date of the expense
                    date_div = document.createElement('div');
                    date_div.innerHTML = `${expense.date}`
                    date_div.className = 'date-div'
                    expense_div.append(date_div);

                    //Expand button
                    expand_button = document.createElement('button');
                    expand_button.className = 'btn';
                    expand_button.onclick = expand;//Functionality
                    expand_icon = document.createElement('i');
                    expand_icon.className = "fa-solid fa-angles-down";
                    expand_button.append(expand_icon);

                    //delete button
                    delete_button = document.createElement('button');
                    delete_button.className = 'btn';
                    delete_button.onclick = delete_function;//Functionality
                    delete_icon = document.createElement('i');
                    delete_icon.className = "fa-solid fa-trash-can";
                    delete_button.append(delete_icon);

                    //Icons div
                    icons_div = document.createElement('div');
                    icons_div.append(expand_button);
                    icons_div.append(delete_button);
                    icons_div.className = "icons-div"
                    expense_div.append(icons_div);

                    expense_container = document.createElement('div');
                    expense_container.className = 'expense-container'; 
                    expense_container.append(expense_div);
                    //Note of the expense
                    if (expense.note === ""){
                        note_div = document.createElement('div');
                        note_div.innerHTML = 'Not note included';
                    }else{
                        note_div = document.createElement('div');
                        note_div.innerHTML = `Note: ${expense.note}`;
                    }
                    note_div.className= 'note-div';
                    note_div.id = `note-${expense.id}`;
                    note_div.style.display = 'none';

                    expense_container.append(note_div);
                    document.querySelector('#list-div').append(expense_container);
                });
            } else {
                console.log('NO EXPENSES');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    })
}

function delete_function(){
    const csrftoken = getCSRFToken();
    fetch(`remove/${this.parentElement.parentElement.id}`,{
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken,  // include the CSRF token
        },
    })
    .then(response => {
        if(response.ok){
            this.parentElement.parentElement.style.animationPlayState = 'running';
            this.parentElement.parentElement.addEventListener('animationend', () => {
                this.parentElement.parentElement.remove();
            });
        }
    })
}
function getCSRFToken() {
    let cookieValue = null;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            cookieValue = cookie.substring('csrftoken='.length, cookie.length);
            break;
        }
    }
    return cookieValue;
}

function expand() {
    const id = this.parentElement.parentElement.id; 
    note = document.querySelector(`#note-${id}`);
    if (note.style.display === 'flex') { 
        note.style.display = 'none';
    } else if (note.style.display === 'none') { 
        note.style.display = 'flex';
    }
}