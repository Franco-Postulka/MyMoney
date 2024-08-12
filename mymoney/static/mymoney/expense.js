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
            console.log(typeof(data)); 
            if (data.length > 0) {
                data.forEach(expense => {
                    console.log(expense.fields.amount);
                });
            } else {
                console.log('NO EXPENSES');
            }
        } catch (error) {
            console.error('Error en forEach:', error);
        }
    })
}

