document.addEventListener('DOMContentLoaded',function(){
    load_section('list')
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
    .then(expenses => {
        console.log(expenses)
        const paragraph =document.createElement('p');
        if (expenses.length > 0){
            paragraph.innerHTML = 'There are expenses';
        }else{
            paragraph.innerHTML = 'No expenses so far';
        }
        document.querySelector('#list-div').append(paragraph);
    })
}

