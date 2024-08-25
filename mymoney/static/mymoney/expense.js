document.addEventListener('DOMContentLoaded',function(){
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');

    if(section === "list-income"){
        list_incomes();
    }else if( section === 'list'){
        list_expenses();
    }
    else{
        list_expenses();
    }
    document.querySelector('#list').addEventListener('click', () => list_expenses());
    document.querySelector('#add').addEventListener('click', () => load_section('add'));
    document.querySelector('#analysis').addEventListener('click', () => analysis());
    document.querySelector('#add-income').addEventListener('click', () => load_section('add-income'));
    document.querySelector('#list-income').addEventListener('click', () => list_incomes());
    document.querySelector('#summary').addEventListener('click', () => summary());

    window.onpopstate = function(event) {
        if (event.state) {
            const section = event.state.section;
            if (section === 'add' || section === 'add-income'){
                load_section(section);
            }
            else if (section === 'list-income'){
                list_incomes();
            }else if (section === 'list'){
                list_expenses();
            }else if (section === 'analysis'){
                analysis();
            }
        }
    }    
})

function load_section(section){
    hide_all_sections();
    document.querySelector(`#${section}-div`).style.display = 'block';
    history.pushState({section: section}, "", `/mymoney?section=${section}`);
}

function hide_all_sections(){
    document.querySelector('#list-div').style.display = 'none';
    document.querySelector('#list-income-div').style.display = 'none';
    document.querySelector('#add-div').style.display = 'none';
    document.querySelector('#add-income-div').style.display = 'none';
    document.querySelector('#analysis-div').style.display = 'none';
    document.querySelector('#summary-div').style.display = 'none';
}

function list_incomes(){
    load_section('list-income');

    document.querySelector('#list-income-div').innerHTML = '';
    title = document.createElement('h1');
    title.innerHTML = 'List of incomes';
    title.className = 'title';
    document.querySelector('#list-income-div').append(title);

    fetch('/mymoney/listincomes')
    .then(response => response.json())
    .then(data =>{
        try{
            if (data.length > 0){
                data.forEach(income => {
                    //Top div of the income
                    income_div = create_movement_div(income,false);

                    movement_container = document.createElement('div');
                    movement_container.className = 'movement-container'; 
                    movement_container.append(income_div);
                    //Note of the income
                    note_div = create_note_div(income,false);

                    movement_container.append(note_div);
                    document.querySelector('#list-income-div').append(movement_container);
                });
            }else{
                movement_container = no_info_aclaration('incomes');
                document.querySelector('#list-income-div').append(movement_container);
            }
        }
        catch (error) {
        console.error('Error:', error);
        }
    })
}
function list_expenses(){
    load_section('list');
    document.querySelector('#list-div').innerHTML = '';
    title = document.createElement('h1');
    title.innerHTML = 'List of expenses';
    title.className = 'title';
    document.querySelector('#list-div').append(title);

    fetch('/mymoney/list')
    .then(response => response.json())
    .then(data => {
        try {
            if (data.length > 0) {
                data.forEach(movement => {
                    //Top div of the expense
                    expense_div = create_movement_div(movement,true);

                    expense_container = document.createElement('div');
                    expense_container.className = 'movement-container'; 
                    expense_container.append(expense_div);
                    //Note of the expense
                    note_div = create_note_div(movement,true);

                    expense_container.append(note_div);
                    document.querySelector('#list-div').append(expense_container);
                });
            } else {
                movement_container = no_info_aclaration('expenses');
                document.querySelector('#list-div').append(movement_container);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    })
}
function no_info_aclaration(movement_str){
    content = document.createElement('div');
    content.innerHTML = `No ${movement_str} yet`;
    content.style.margin = 'auto';
    movement_container = document.createElement('div');
    movement_container.className = 'movement-container'; 
    movement_container.append(content);
    return movement_container;
}
function create_note_div(movement,is_expense){
    if (movement.note === ""){
        note_div = document.createElement('div');
        note = document.createElement('div');
        note.innerHTML = 'Without note';
        note_div.append(note);
    }else{
        note_div = document.createElement('div');
        note = document.createElement('div');
        note.innerHTML = `${movement.note}`;
        note_div.append(note);
    }
    note_div.className= 'note-div';
    note_div.id = `note-${movement.id}`;
    note_div.style.display = 'none';
    if (is_expense){
        const payment_clone = payment_div.cloneNode(true);
        payment_clone.className = 'payment-div-clone';
        payment_clone.style.display = 'none';
        note_div.append(payment_clone);
    }
    const category_clone = category_div.cloneNode(true);
    category_clone.className = 'category-div-clone';
    category_clone.style.display = 'none';
    note_div.append(category_clone);

    return note_div;
}
function create_movement_div(movement,is_expense){
    movement_div = document.createElement('div');
    movement_div.className = 'movement-div'; 
    movement_div.setAttribute("id", `${movement.id}`);

    amount_div = document.createElement('div');
    amount_div.innerHTML = `$${movement.amount.toLocaleString()} `
    amount_div.className = 'amount-div'
    movement_div.append(amount_div);

    if (movement.category === null){
        category_div = document.createElement('div');
        category_div.innerHTML = 'No category'
    }else{
        category_div = document.createElement('div');
        category_div.innerHTML = `${movement.category}`;
    }
    category_div.className = 'category-div';
    movement_div.append(category_div);

    if (is_expense){
        //Pyment method of the expense
        if (movement.payment_method === null){
            payment_div = document.createElement('div');
            payment_div.innerHTML = 'No payment method';
        }else{
            payment_div = document.createElement('div');
            payment_div.innerHTML = `${movement.payment_method}`;
        }
        payment_div.className= 'payment-div';
        movement_div.append(payment_div);
    }
    //Date
    date_div = document.createElement('div');
    date_div.innerHTML = `${movement.date}`
    date_div.className = 'date-div'
    movement_div.append(date_div);
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
    if (is_expense){
        delete_button.onclick = delete_expense;//Functionality
    }else{
        delete_button.onclick = delete_income;//Functionality
    }
    delete_icon = document.createElement('i');
    delete_icon.className = "fa-solid fa-trash-can";
    delete_button.append(delete_icon);

    //Icons div
    icons_div = document.createElement('div');
    icons_div.append(expand_button);
    icons_div.append(delete_button);
    icons_div.className = "icons-div"
    movement_div.append(icons_div);

    return movement_div
}
function delete_income(){
    delete_function('remove_income',this);
}
function delete_expense(){
    delete_function('remove',this);
}
function delete_function(first_url_part,objeto){
    const csrftoken = getCSRFToken();
    fetch(`mymoney/${first_url_part}/${objeto.parentElement.parentElement.id}`,{
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken,  // include the CSRF token
        },
    })
    .then(response => {
        if(response.ok){
            objeto.parentElement.parentElement.parentElement.style.animationPlayState = 'running';
            objeto.parentElement.parentElement.parentElement.addEventListener('animationend', () => {
                objeto.parentElement.parentElement.parentElement.remove();
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
    const note = document.querySelector(`#note-${id}`);
    if (note.style.display === 'flex') { 
        note.style.display = 'none';
    } else if (note.style.display === 'none') { 
        note.style.display = 'flex';
    }
}
function analysis(){
    load_section('analysis');

    document.querySelector('#analysis-div').innerHTML = '';
    title = document.createElement('h1');
    title.innerHTML = 'Analysis';
    title.className = 'title';
    document.querySelector('#analysis-div').append(title);
    
    div_filters = document.createElement('div');
    div_filters.id = 'div-filters';
    div_filters.innerHTML= 'Filter date: '
    document.querySelector('#analysis-div').append(div_filters);

    main_charts_div = document.createElement('div');
    main_charts_div.id = 'main-charts-div';
    document.querySelector('#analysis-div').append(main_charts_div);

    fetch('/mymoney/periods')
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            //Select for years
            const select_year = document.createElement('select');
            select_year.id = 'select-year';  
            div_filters.append(select_year);
            // Options for select year
            data.forEach(year => {
                const year_option = document.createElement('option');
                year_option.value = year['year'];
                year_option.innerHTML = year['year'];
                select_year.append(year_option);
            });
            //Select for months
            const select_month = document.createElement('select');
            select_month.id = 'select-month';
            div_filters.append(select_month);
            // Change in select year
            select_year.addEventListener('change', function() {
                select_month.innerHTML = '';
                const selected_year = this.value;
                let year_months = [];
                data.forEach(year =>{
                    if (year['year'] == selected_year){
                        year_months = year['months'];
                    }
                })
                // Fill in the month selection
                if (year_months) {
                    year_months.forEach(month => {
                        const month_option = document.createElement('option');
                        month_option.value = month;
                        month_option.innerHTML = month;
                        select_month.append(month_option);
                    });
                }
                select_date();
            });
            select_month.addEventListener('change', select_date);
            // Selects the first element of the select 
            select_year.dispatchEvent(new Event('change'));
        }else{
            movement_container = no_info_aclaration('expenses');
            document.querySelector('#list-div').append(movement_container);
        }
    });
}

function select_date(){
    const selected_month = document.querySelector('#select-month').value;
    const selected_year = document.querySelector('#select-year').value;
    make_payment_pie(selected_year,selected_month);
    make_category_pie(selected_year,selected_month);
}

function make_category_pie(year, month){
    const actual_chart_divs = document.querySelector('#chart-container-category');
    if (actual_chart_divs){
        actual_chart_divs.remove();
    }
    const chart_div = document.createElement('div');
    chart_div.className = 'chart-div';
    title = document.createElement('h2');
    title.innerHTML = 'Category';
    container_title_chart = document.createElement('div');
    container_title_chart.append(title);
    container_title_chart.append(chart_div)
    container_title_chart.className = 'chart-container';
    container_title_chart.id = 'chart-container-category';
    document.querySelector('#main-charts-div').append(container_title_chart);

    fetch(`/mymoney/expercategory?year=${year}&month=${month}`)
    .then(response => response.json())
    .then(data => {
            if (data.length > 0) {
                const chart = echarts.init(chart_div);
                chart.setOption(getPie(data));
            }
        }
    );
}

function make_payment_pie(year, month){
    const actual_chart_divs = document.querySelector('#chart-container-py');
    if (actual_chart_divs){
        actual_chart_divs.remove();
    }
    const chart_div = document.createElement('div');
    chart_div.className = 'chart-div';
    title = document.createElement('h2');
    title.innerHTML = 'Payment Method';
    container_title_chart = document.createElement('div');
    container_title_chart.append(title);
    container_title_chart.append(chart_div);
    container_title_chart.className = 'chart-container';
    container_title_chart.id = 'chart-container-py';
    document.querySelector('#main-charts-div').append(container_title_chart);

    fetch(`/mymoney/experpayment?year=${year}&month=${month}`)
    .then(response => response.json())
    .then(data => {
            if (data.length > 0) {
                const chart = echarts.init(chart_div);
                chart.setOption(getCompletePie(data));
            }
        }
    );
}
function summary(){
    load_section('summary');
    document.querySelector('#summary-div').innerHTML = '';
    
    title = document.createElement('h1');
    title.innerHTML = 'Summary';
    title.className = 'title';
    document.querySelector('#summary-div').append(title);

    main_charts_div = document.createElement('div');
    main_charts_div.id = 'main-charts-div-summary';
    document.querySelector('#summary-div').append(main_charts_div);

    make_expense_vs_income_chart();
}

function make_expense_vs_income_chart(){
    const actual_chart_divs = document.querySelector('#chart-container-vs');
    if (actual_chart_divs){
        actual_chart_divs.remove();
    }
    const chart_div = document.createElement('div');
    chart_div.className = 'chart-div';
    chart_div.id = 'chart-div-vs';
    container_chart = document.createElement('div');
    container_chart.append(chart_div)
    container_chart.className = 'chart-container';
    container_chart.id = 'chart-container-vs';
    document.querySelector('#main-charts-div-summary').append(container_chart);

    fetch("/mymoney/summarygraphics/")
    .then(response => response.json())
    .then(data => {
            if (data) {
                const chart = echarts.init(chart_div);
                if (window.innerWidth <= 400){
                    chart.setOption(get_bar_vs_mobile(data));
                }else{
                    chart.setOption(get_bar_vs(data));
                }
            }
        }
    );
}

const get_bar_vs = (dictionary_values) => {
    return {
        title: {
            text: 'Expenses vs Income',
        },
        tooltip: {
        trigger: 'axis'
        },
        legend: {
        data: ['Expenses', 'Incomes'],
        },
        toolbox: {
        show: true,
        feature: {
            dataView: { show: true, readOnly: true },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
        }
        },
        calculable: true,
        xAxis: [
        {
            type: 'category',
            data: dictionary_values['dates']
        }
        ],
        yAxis: [
        {
            type: 'value'
        }
        ],
        series: [
        {
            name: 'Expenses',
            type: 'bar',
            data: dictionary_values['expenses'],
            markPoint: {
            data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
            ]
            },
            markLine: {
            data: [{ type: 'average', name: 'Avg' }]
            }
        },
        {
            name: 'Incomes',
            type: 'bar',
            data: dictionary_values['incomes'],
            markPoint: {
                data: [
                    { type: 'max', name: 'Max' },
                    { type: 'min', name: 'Min' }
                ]
            },
            markLine: {
            data: [{ type: 'average', name: 'Avg' }]
            }
        }
        ]
    };
}

const get_bar_vs_mobile = (dictionary_values) => {
    return {
        title: {
            text: 'Expenses vs Income',
            show: false
        },
        tooltip: {
        trigger: 'axis'
        },
        legend: {
        data: ['Expenses', 'Incomes'],
        left: 'left',
        },
        toolbox: {
        show: true,
        feature: {
            dataView: { show: true, readOnly: true },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
        }
        },
        calculable: true,
        xAxis: [
        {
            type: 'category',
            data: dictionary_values['dates']
        }
        ],
        yAxis: [
        {
            type: 'value'
        }
        ],
        series: [
        {
            name: 'Expenses',
            type: 'bar',
            data: dictionary_values['expenses'],
            markPoint: {
            data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
            ]
            },
            markLine: {
            data: [{ type: 'average', name: 'Avg' }]
            }
        },
        {
            name: 'Incomes',
            type: 'bar',
            data: dictionary_values['incomes'],
            markPoint: {
                data: [
                    { type: 'max', name: 'Max' },
                    { type: 'min', name: 'Min' }
                ]
            },
            markLine: {
            data: [{ type: 'average', name: 'Avg' }]
            }
        }
        ]
    };
}

const getPie = (arr_vlues) => {
    return {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
            name: 'Category',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: arr_vlues
            }
        ]
        };
}

const getCompletePie = (arr_vlues) => {
    return {
        tooltip: {
        trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
        {
            name: 'Payment Method',
            type: 'pie',
            radius: '70%',
            data: arr_vlues,
            emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
            }
        }
        ]
    };
}

