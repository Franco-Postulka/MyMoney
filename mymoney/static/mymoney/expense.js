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

                    amount_div = document.createElement('div');
                    amount_div.innerHTML = `$ ${expense.amount} `
                    amount_div.className = 'amount-div'
                    expense_div.append(amount_div);
                    
                    if (expense.category === null){
                        category_div = document.createElement('div');
                        category_div.innerHTML = 'No category'
                    }else{
                        category_div = document.createElement('div');
                        category_div.innerHTML = `${expense.category}`;
                    }
                    expense_div.append(category_div);

                    if (expense.payment_method === null){
                        payment_div = document.createElement('div');
                        payment_div.innerHTML = 'No payment method'
                    }else{
                        payment_div = document.createElement('div');
                        payment_div.innerHTML = `${expense.payment_method}`;
                    }
                    expense_div.append(payment_div);

                    date_div = document.createElement('div');
                    date_div.innerHTML = `${expense.date}`
                    date_div.className = 'date-div'
                    expense_div.append(date_div);
                    
                    document.querySelector('#list-div').append(expense_div);
                });
            } else {
                console.log('NO EXPENSES');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    })
}

