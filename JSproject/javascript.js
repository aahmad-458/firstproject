//to pick a backround color
let allfilters = document.querySelectorAll('.filter div');
let grid = document.querySelector('.grid');

let colors = {
    pink: '#fdd5db',
    blue: '#a2e9f2',
    green: '#b4f5f5',
    black: '#6b6a6a'
};
let colorClasses = ["pink", "blue", "green", "black"];
let uid = new ShortUniqueId();

//handling the deletion of the cards
let deleteState = false;
let deleteBtn = document.querySelector('.delete');
deleteBtn.addEventListener('click', (e)=>{
    if(deleteState){
        deleteState = false;
        e.currentTarget.classList.remove('delete-state');   
    }
    else{
        deleteState = true;
        e.currentTarget.classList.add('delete-state');   
    }    
})


for(let i=0; i<allfilters.length; i++)
    {
        allfilters[i].addEventListener('click', function(e) {
            if(e.currentTarget.parentElement.classList.contains('selected-filter')){
                e.currentTarget.parentElement.classList.remove('selected-filter');
                loadTasks();
            } else{
                let color = e.currentTarget.classList[0].split('-')[0];
                e.currentTarget.parentElement.classList.add('selected-filter');
                // grid.style.background = colors[color];
                loadTasks(color);
            }
        });
    }

//local storage initialization step
if(!localStorage.getItem('tasks'))
{
    localStorage.setItem('tasks', JSON.stringify([]));
}

//to pop up to modal
let modalVisible = false;
let body = document.querySelector('body');
let add = document.querySelector('.add');
let gridDel = document.querySelector('.grid');
gridDel.addEventListener('click', (e)=>{
if(modalVisible){
        let del = document.querySelector('.modal-container');
        console.log('clicked'); 
        del.classList.remove("modal-container");   
        modalVisible = false;
    }  
});

add.addEventListener('click', (e)=>{
    if(modalVisible){
        return;
    }  
    
    if(deleteBtn.classList.contains('delete-state')){
        deleteBtn.classList.remove('delete-state');
        deleteState = false;
    }

    let div = document.createElement('div');
    div.classList.add("modal-container");
    div.setAttribute('click-first', true);
    div.innerHTML = `<div class="writing-area" contenteditable>Enter Your Task</div>
    <div class="filter-area">
    <div class="modal-filter pink"></div>
    <div class="modal-filter blue"></div>
    <div class="modal-filter green"></div>
    <div class="modal-filter black active-modal-filter"></div>
    </div>';`

    // to remove enter your task on click
    let wa = div.querySelector('.writing-area');
    wa.addEventListener('click', (e)=>{
        if(div.getAttribute('click-first') == 'true')
        {  
            wa.innerHTML = '';
            div.setAttribute('click-first', 'false');
        } 
    });

    //to ensure that the entered text is of selected color
    wa.addEventListener('keypress', (e)=>{
        if(e.key == 'Enter')
        {
            let task = e.currentTarget.innerText;
            let selectedModalFilter = document.querySelector('.active-modal-filter');
            let color = selectedModalFilter.classList[1];
            let ticket = document.createElement('div');
            let id = uid();
            ticket.classList.add('ticket');
            ticket.innerHTML = `<div class="ticket-color ${color}"></div>
            <div class="ticket-id">#${id}</div>
            <div class="ticket-box" contenteditable>
            ${task}
            </div>
            </div>`;
    
            saveTicketInLocalStorage(id, color, task);
    
            let ticketWritingArea = ticket.querySelector('.ticket-box');
            ticketWritingArea.addEventListener('input', ticketWritingAreaHandler);
    
            ticket.addEventListener('click', (e)=>{
                if(deleteState)
                {
                    let id = e.currentTarget.parentElement.querySelector('.ticket-id').innerText.split('#')[1];
                    let tasksArr = JSON.parse(localStorage.getItem('tasks'));
                
                    tasksArr = tasksArr.filter(function(el){
                        return el.id != id;
                    });

                    localStorage.setItem('tasks', JSON.stringify(tasksArr));

                    e.currentTarget.remove();
                }
            });
            
            let ticketColorDiv = ticket.querySelector('.ticket-color');
            ticketColorDiv.addEventListener('click', ticketColorHandler);
            document.querySelector('.grid').appendChild(ticket);
            div.remove();
            modalVisible = false;
        }
    });

    body.appendChild(div);
    modalVisible = true;
    
    //highlighting the selected color
    let allModalFilters = document.querySelectorAll('.modal-filter');
    for(let i=0; i<allModalFilters.length; i++){
        
        allModalFilters[i].addEventListener('click', (e)=>{

            for(let j=0; j<allModalFilters.length; j++)    
            {
                allModalFilters[j].classList.remove('active-modal-filter');
            }
            allModalFilters[i].classList.add('active-modal-filter');
        });
    }
});

function saveTicketInLocalStorage(id, color, task)
{
    let requiredObject = {id, color, task};
    let tasksArr = JSON.parse(localStorage.getItem('tasks'));
    tasksArr.push(requiredObject);
    localStorage.setItem('tasks', JSON.stringify(tasksArr));
}


function ticketColorHandler(e){
    let id = e.currentTarget.parentElement.querySelector('.ticket-id').innerText.split('#')[1];
    let tasksArr = JSON.parse(localStorage.getItem('tasks'));
    let reqIdx = -1;
    for(let i=0; i<tasksArr.length; i++)
    {
        if(tasksArr[i].id == id)
        {
            reqIdx = i;
            break;
        }
    }
    
    let currColor = e.currentTarget.classList[1];
    let index = colorClasses.indexOf(currColor);      //give us the index of an element in an array
    index++;
    index =  index % 4;
    e.currentTarget.classList.remove(currColor);
    e.currentTarget.classList.add(colorClasses[index]);
    
    tasksArr[reqIdx].color = colorClasses[index];
    localStorage.setItem('tasks', JSON.stringify(tasksArr));
}

function ticketWritingAreaHandler(e){
    let id = e.currentTarget.parentElement.querySelector('.ticket-id').innerText.split('#')[1];
    let tasksArr = JSON.parse(localStorage.getItem('tasks'));
    let reqIdx = -1;
    for(let i=0; i<tasksArr.length; i++)
    {
        if(tasksArr[i].id == id)
        {
            reqIdx = i;
            break;
        }
    }

    tasksArr[reqIdx].task = e.currentTarget.innerText;
    localStorage.setItem('tasks', JSON.stringify(tasksArr));
}

let loadTasks = (passedColor)=>{
    let allTickets = document.querySelectorAll('.ticket');
    for(let t=0; t<allTickets.length; t++)
    allTickets[t].remove();

    let tasks = JSON.parse(localStorage.getItem('tasks'));
    for(let i=0; i<tasks.length; i++)
    {
        let id = tasks[i].id;
        let color = tasks[i].color;
        let tasksValue = tasks[i].task;

        if(passedColor)
        {
            if(passedColor != color)
            continue;            
        }

        let ticket = document.createElement('div');
        ticket.classList.add('ticket');
        ticket.innerHTML = `<div class="ticket-color ${color}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="ticket-box" contenteditable>
        ${tasksValue}
        </div>
        </div>`;

        let ticketWritingArea = ticket.querySelector('.ticket-box');
        ticketWritingArea.addEventListener('input', ticketWritingAreaHandler);

        let ticketColorDiv = ticket.querySelector('.ticket-color');
        ticketColorDiv.addEventListener('click', ticketColorHandler);   
        
        ticket.addEventListener('click', (e)=>{
            if(deleteState)
            {
                let id = e.currentTarget.parentElement.querySelector('.ticket-id').innerText.split('#')[1];
                let tasksArr = JSON.parse(localStorage.getItem('tasks'));
            
                tasksArr = tasksArr.filter(function(el){
                    return el.id != id;
                });
                localStorage.setItem('tasks', JSON.stringify(tasksArr));

                e.currentTarget.remove();
            }
        });
        grid.appendChild(ticket);
    }
    
}

loadTasks();