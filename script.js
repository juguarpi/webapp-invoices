"use strict"


var invNumber = 0;         //state
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

class BillFrom{
    constructor(stradd, city, pcode, country){
        this.streetAddress=stradd;
        this.city=city;
        this.postCode=pcode;
        this.country=country;
    }
}

var billFrom1=new BillFrom("100 Jurong East Avenue", "Singapore","123456", "Singapore")
var billFrom2=new BillFrom("32 Bukit East Street", "Jakarta","345678", "Indonesia")

class BillTo{
    constructor(name, email,stradd, city, pcode, country){
        this.name=name;
        this.email=email;
        this.streetAddress=stradd;
        this.city=city;
        this.postCode=pcode;
        this.country=country;
    }
}

var billTo1= new BillTo("Sally Perter", "SallyPeter@abc.com", "65 Half Moon Crescent", "Tokyo","973678", "Japan")
var billTo2= new BillTo("John Mike", "JohnMike@abc.com", "23 Cooperation Road", "Kuala Lumpur","653298", "Malaysia")
var billTo3= new BillTo("Tom Eric", "TomEric@abc.com", "43 Safe Street", "Seoul","567298", "South Korean")

class Item{
    constructor(name, qty, price){
        this.name=name;
        this.qty=qty;
        this.price=price;
    }
    getItemTotalAmt(){
        return Number(this.qty)*Number(this.price);
    }

    getItemTotalString(){
        return formatter.format(Number(this.qty)*Number(this.price));
    }
}

var item1=new Item("Graphic Design", "2", "150");
var item2=new Item("Email Design", "5", "150");
var item3=new Item("Consulation", "4", "750");
var item4=new Item("Transportation", "3", "80");
var items1=[item1, item2, item3];
var items2=[item3, item1, item4];
var items3=[item2, item4, item1];
var items4=[item2, item4, item1,item3];
var items5=[item2, item4]
var items6=[item1, item4]

class Invoice{
    constructor(billFrom, billTo, invDate, payTerm, description, items, status){
        this.billFrom=billFrom;
        this.billTo=billTo;
        this.invDate=invDate;
        this.payTerm=payTerm;
        this.description=description;
        this.items=items;
        this.status=status;
        this.sn=this.snGeneration();
    }
    snGeneration(){
        invNumber++;
        const sn=invNumber.toString().padStart(2,"0")
        const date = new Date()
        const yy = date.getFullYear().toString().substring(2);
        const mm= date.getMonth().toString().padStart(2,"0");
        const dd= date.getDate().toString().padStart(2,"0");
        const snString= yy.concat(mm,dd,sn);
        if (this.status==="Draft") return snString + "-D";
        return snString;
    }
    getInvTotalString(){
        const itemTotalArray=this.items.map((e)=>e.getItemTotalAmt());
        const total = itemTotalArray.reduce((acc, cur)=> acc + cur, 0);
        return formatter.format(total);
    }
    getDueDateString(){
        if (this.invDate==="") return;
        let dueDate = new Date(this.invDate);
        dueDate.setDate(dueDate.getDate()+ Number(this.payTerm));
        let dueDateString=dueDate.toISOString().slice(0,10);
        return dueDateString; 
    }
    updateInvoice(billFrom, billTo, invDate,payTerm, description, items, status){
    if(status==="Pending"){
        this.sn= (this.sn.includes("-D"))? this.sn.substring(0,11):this.sn;
    }
    if(status==="Draft"){
        this.sn= (this.sn.includes("-D"))? this.sn : this.sn + "-D";
    }

    this.billFrom=billFrom;
    this.billTo=billTo;
    this.invDate=invDate;
    this.payTerm=payTerm;
    this.description=description;
    this.items=items;
    this.status=status;
    }
}

var invoice1= new Invoice(billFrom1,billTo1,"2020-04-20","60","Graphic Design", items1, "Pending");
var invoice2= new Invoice(billFrom2,billTo3,"2020-01-19","30","Consultation Project", items2, "Paid");
var invoice3= new Invoice(billFrom1,billTo2,"2020-03-10","60","Apple Project", items3, "Draft");
var invoice4= new Invoice(billFrom2,billTo2,"2020-05-20","60","Email Design", items4, "Pending");
var invoice5= new Invoice(billFrom1,billTo3,"2020-07-16","30","Consultation Project2", items5, "Paid");
var invoice6= new Invoice(billFrom2,billTo1,"2020-08-13","60","Orange Project", items6, "Draft");

//Starting Invoices List
var invoices = [invoice1,invoice2,invoice3, invoice4, invoice5, invoice6];

// Temp variables needed for new or edit invoice pages
var targetEditInvSn;
var tempBillFrom=new BillFrom("","","","");
var tempBillTo=new BillTo("","","","","","");
var tempInvDate="";
var tempProjDescrip="";
var tempPayTerm="30";
var tempItems=[];
var filterKeyWord ="All";
var mainPageOn= true;
var newInvPageOn = false;
var invPageOn= false;
var editInvPageon= false;
//////////////////////////////////////////MODULE//////////////////////////////////////////////////////////////

function addInvoice(invoice){
    invoices.push(invoice); 
    
    setStorage()
}

function deleteInvoice(sn){
    const indexToDel=invoices.findIndex((e)=>e.sn===sn);
    if(indexToDel !==-1) invoices.splice(indexToDel,1);

    setStorage()
}

function findInvoice(sn){
   return invoices.find(e=>e.sn===sn); 
}

function filterInvoices(status){  //For filterbar use
    const filteredInvoices= status==='All'? invoices : invoices.filter((e)=>e.status=== status);
    filterKeyWord=status;

    setStorage()
    return filteredInvoices
}

function getInvoiceStatusArray(invoices){ //For filterbar use
    const statusArray=invoices.reduce((acc, curr)=>{
        if (!(acc.includes(curr.status))){ 
        acc.push(curr.status);
        return acc;
    }
        else return acc}, ["All"])
    return statusArray
}

function saveNewInvoiceTempData(){
    tempBillFrom=new BillFrom(
        inputBillFromAddress.value, 
        inputBillFromCity.value, 
        inputBillFromPostCode.value, 
        inputBillFromCountry.value
        );
    tempBillTo=new BillTo(
        inputBillToName.value,
        inputBillToEmail.value,
        inputBillToAddress.value, 
        inputBillToCity.value, 
        inputBillToPostCode.value, 
        inputBillToCountry.value
        );
    tempInvDate=inputInvDate.value;
    tempProjDescrip=inputProjectDescrip.value;
    tempPayTerm=inputPayTerm.value;

    setStorage()
}

function copyEditInvtoTempData(sn){
    const targetInv= findInvoice(sn);
    tempBillFrom = new BillFrom(
        targetInv.billFrom.streetAddress,
        targetInv.billFrom.city,
        targetInv.billFrom.postCode,
        targetInv.billFrom.country
    );
    tempBillTo = new BillTo(
        targetInv.billTo.name,
        targetInv.billTo.email,
        targetInv.billTo.streetAddress,
        targetInv.billTo.city,
        targetInv.billTo.postCode,
        targetInv.billTo.country
    )
    tempInvDate=targetInv.invDate;
    tempProjDescrip=targetInv.description;
    tempPayTerm=targetInv.payTerm;
    tempItems=[...targetInv.items];

    setStorage()
}

function saveEditInvoiceTempData(){
    tempBillFrom=new BillFrom(
        inputBillFromAddress_EditInv.value, 
        inputBillFromCity_EditInv.value, 
        inputBillFromPostCode_EditInv.value, 
        inputBillFromCountry_EditInv.value
        );
    tempBillTo=new BillTo(
        inputBillToName_EditInv.value,
        inputBillToEmail_EditInv.value,
        inputBillToAddress_EditInv.value, 
        inputBillToCity_EditInv.value, 
        inputBillToPostCode_EditInv.value, 
        inputBillToCountry_EditInv.value
        );
    tempInvDate=inputInvDate_EditInv.value;
    tempProjDescrip=inputProjectDescrip_EditInv.value;
    tempPayTerm=inputPayTerm_EditInv.value;

    setStorage()
}

function clearTempData(){
    tempBillFrom=new BillFrom("","","","");
    tempBillTo=new BillTo("","","","","","");
    tempInvDate="";
    tempProjDescrip="";
    tempPayTerm="30";
    tempItems=[];

    setStorage()
}

/////////////////////////UI//////////////////UI////////////////////////////////////////////////////

//DOM selectors
///invoices page and individual invoice page
const labelInvoicesPage1=document.querySelector(".content-invoices-page1");
const labelInvoicePage2=document.querySelector(".content-invoice-page2");
///Invoices page
const labelInvsTotalNumber =document.querySelector('.invoices__total-number')
const labelInvList= document.querySelector('.invoices__list');
const btnFilterBarBox= document.querySelector('.invoices__filter-bar-box');
const labelFilterBarText= document.querySelector('.invoices__filter-bar-text');
const labelDropList= document.querySelector('.invoices__filter-droplist')
///New Invoice Page
const btnCreatNewInvoice=document.querySelector('.btn--creat-new-invoice');
const labelNewInvOverLay=document.querySelector('.new-invoice__overlay');
const btnDischardNewInv=document.querySelector('.btn--invoice-discard');
const btnSaveNewInvDraft=document.querySelector('.btn--invoice-save-draft');
const btnSaveSendNewInv=document.querySelector('.btn--invoice-save-send');
/// New Invoices Page inputs
const inputBillFromAddress=labelNewInvOverLay.querySelector('.bill-from-address-input');
const inputBillFromCity=labelNewInvOverLay.querySelector('.bill-from-city-input');
const inputBillFromPostCode=labelNewInvOverLay.querySelector('.bill-from-post-code-input');
const inputBillFromCountry=labelNewInvOverLay.querySelector('.bill-from-country-input');
const inputBillToName=labelNewInvOverLay.querySelector('.bill-to-client-name-input');
const inputBillToEmail=labelNewInvOverLay.querySelector('.bill-to-client-email-input');
const inputBillToAddress=labelNewInvOverLay.querySelector('.bill-to-address-input');
const inputBillToCity=labelNewInvOverLay.querySelector('.bill-to-city-input');
const inputBillToPostCode=labelNewInvOverLay.querySelector('.bill-to-post-code-input');
const inputBillToCountry=labelNewInvOverLay.querySelector('.bill-to-country-input');
const inputInvDate=labelNewInvOverLay.querySelector('.invoice-date-input');
const inputPayTerm=labelNewInvOverLay.querySelector('.invoice-payment-term-input');
const inputProjectDescrip=labelNewInvOverLay.querySelector('.invoice-project-description-input');
const labelInvItemList=labelNewInvOverLay.querySelector('.item-breakdowns');
const btnAddNewItem=labelNewInvOverLay.querySelector('.btn--invoice-item-add-new');
const inputFields = labelNewInvOverLay.querySelectorAll('input');
///individual Invoice Page
const btnGoBack=document.querySelector('.btn--go-back');
const labelInvStatus=document.querySelector('.invoice__status');
const btnEditInvoice=document.querySelector('.btn--edit');
const btnDeleteInvoice=document.querySelector('.btn--delete');
const btnMarkUpPaid=document.querySelector('.btn--markaspaid');
const labelInvSn=document.querySelector('.invoice__sn');
const labelInvDescrip=document.querySelector('.invoice__description');
const labelBillFromAddress=document.querySelector('.invoice__from-address-street');
const labelBillFromCity=document.querySelector('.invoice__from-address-city');
const labelBillFromPostCode=document.querySelector('.invoice__from-address-postcode');
const labelBillFromCountry=document.querySelector('.invoice__from-address-country');
const labelInvDate=document.querySelector('.invoice__date');
const labelInvDueDate=document.querySelector('.invoice__due-date');
const labelBillToName=document.querySelector('.invoice__client-name')
const labelBillToAddress=document.querySelector('.invoice__to-address-street');
const labelBillToCity=document.querySelector('.invoice__to-address-city');
const labelBillToPostCode=document.querySelector('.invoice__to-address-postcode');
const labelBillToCountry=document.querySelector('.invoice__to-address-country');
const labelBillToEmail=document.querySelector('.invoice__client-email')
const table=document.querySelector('table');
const labelInvTotalAmt=document.querySelector('.invoice__total-value');

//Edit invoice page
const labelEditInvOverLay=document.querySelector('.edit-invoice__overlay');
const btnCancelEdit=document.querySelector('.btn--edit-invoice-cancel');
const btnSaveDraftEdit=document.querySelector('.btn--edit-invoice-savedraft');
const btnSaveSendEdit=document.querySelector('.btn--edit-invoice-save');
const labelInvSn_EditInv=document.querySelector('.edit-invoice-number')
//Edit invoice page inputs

const inputBillFromAddress_EditInv=labelEditInvOverLay.querySelector('.bill-from-address-input');
const inputBillFromCity_EditInv=labelEditInvOverLay.querySelector('.bill-from-city-input');
const inputBillFromPostCode_EditInv=labelEditInvOverLay.querySelector('.bill-from-post-code-input');
const inputBillFromCountry_EditInv=labelEditInvOverLay.querySelector('.bill-from-country-input');
const inputBillToName_EditInv=labelEditInvOverLay.querySelector('.bill-to-client-name-input');
const inputBillToEmail_EditInv=labelEditInvOverLay.querySelector('.bill-to-client-email-input');
const inputBillToAddress_EditInv=labelEditInvOverLay.querySelector('.bill-to-address-input');
const inputBillToCity_EditInv=labelEditInvOverLay.querySelector('.bill-to-city-input');
const inputBillToPostCode_EditInv=labelEditInvOverLay.querySelector('.bill-to-post-code-input');
const inputBillToCountry_EditInv=labelEditInvOverLay.querySelector('.bill-to-country-input');
const inputInvDate_EditInv=labelEditInvOverLay.querySelector('.invoice-date-input');
const inputPayTerm_EditInv=labelEditInvOverLay.querySelector('.invoice-payment-term-input');
const inputProjectDescrip_EditInv=labelEditInvOverLay.querySelector('.invoice-project-description-input');
const labelInvItemList_EditInv=labelEditInvOverLay.querySelector('.item-breakdowns');
const btnAddNewItem_EditInv=labelEditInvOverLay.querySelector('.btn--invoice-item-add-new');
const inputFields_EditInv=labelEditInvOverLay.querySelectorAll('input');

//UI Page and Component Rendering
// Invoices Page1 and Invoice Page2
function openInvoicesPage(){
    if(labelInvoicesPage1.classList.contains('invoices-page-hide')) labelInvoicesPage1.classList.remove('invoices-page-hide');
    if(labelInvoicePage2.classList.contains('invoice-page-show')) labelInvoicePage2.classList.remove('invoice-page-show');
    if(btnMarkUpPaid.classList.contains('btn--hide')) btnMarkUpPaid.classList.remove('btn--hide');
    if(labelInvStatus.classList.contains('status--Paid')) labelInvStatus.classList.remove('status--Paid');
    if(labelInvStatus.classList.contains('status--Pending')) labelInvStatus.classList.remove('status--Pending');
    if(labelInvStatus.classList.contains('status--Draft')) labelInvStatus.classList.remove('status--Draft');
    mainPageOn=true;
    invPageOn=false;

    setStorage()
}

function openInvoicePage(){
    labelInvoicesPage1.classList.add('invoices-page-hide');
    labelInvoicePage2.classList.add('invoice-page-show');
    mainPageOn=false;
    invPageOn=true;

    setStorage()
}

//Invoices Page invoices List items
function invoicesListItemMarkUp(invoice){
    return `<div class="invoices__list-item" data-sn=${invoice.sn}>
    <span class="text-2 invoices__list-item-sn">INV${invoice.sn}</span>
    <span class="text-1 invoices__list-item-due-date">Due ${invoice.invDate}</span>
    <span class="text-1 invoices__list-item-clientname">${invoice.billTo.name}</span>
    <span class="text-3 invoices__list-item-amount">${invoice.getInvTotalString()}</span>
    <span class="status invoices__list-item-status status--${invoice.status}">* ${invoice.status}</span>
    <span class="text-2 invoices__list-item-rightarrow icon-play3"></span>
</div>`
}
function renderInvListOnInvsPage(invoices){
    ////clear/////
    labelInvList.innerHTML="";
    /////then render content////
     labelInvsTotalNumber.textContent=invoices.length; ////Total Number
     invoices.forEach(e => labelInvList.insertAdjacentHTML("afterbegin", invoicesListItemMarkUp(e)));    ////List of Invoice 
    
}

//New Invoice Page
function openNewInvPage(){
    labelNewInvOverLay.classList.add('overlay--shown');
    newInvPageOn=true;

    setStorage()
}

function closeNewInvPage(){
    if(labelNewInvOverLay.classList.contains('overlay--shown')) labelNewInvOverLay.classList.remove('overlay--shown');
    clearTempData();
    renderInvPageFromTempStore(); // Clear content on new Inv Page
    newInvPageOn=false;

    setStorage()
}

function renderInvPageFromTempStore(){    //UI update
    inputBillFromAddress.value=tempBillFrom.streetAddress;
    inputBillFromCity.value=tempBillFrom.city;
    inputBillFromPostCode.value=tempBillFrom.postCode;
    inputBillFromCountry.value=tempBillFrom.country;
    inputBillToName.value=tempBillTo.name;
    inputBillToEmail.value=tempBillTo.email;
    inputBillToAddress.value=tempBillTo.streetAddress;
    inputBillToCity.value=tempBillTo.city
    inputBillToPostCode.value=tempBillTo.postCode;
    inputBillToCountry.value=tempBillTo.country;
    inputInvDate.value=tempInvDate;
    inputPayTerm.value=tempPayTerm
    inputProjectDescrip.value=tempProjDescrip;
    renderItemsOnNewInv(tempItems);
}

function renderItemsOnNewInv(items){
    labelInvItemList.innerHTML="";
    if (items.length!=0){
        items.forEach((item,i)=>{
            labelInvItemList.insertAdjacentHTML("beforeend", 
            `<div class="description-table-item-row grid-in-row">
            <input type="text" class="item-name-input text-2 item${i}NameInput" value="${item.name}">
            <input type="number" class="item-qty-input text-2 item${i}QtyInput" value="${item.qty}">
            <input type="number" class="item-price-input text-2 item${i}PriceInput" value="${item.price}">
            <p class="item-total-price text-2 item${i}Total">${item.getItemTotalString()}</p>
            <button class="btn btn--new-inovice-item-delete btn-text-2 item${i}DeleteBtn"><span class="icon-bin"> </span></button>
            </div>`);
            //realtime monitoring of input change of item 
            const itemNameInput= labelInvItemList.querySelector(`.item${i}NameInput`);
            const itemQtyInput= labelInvItemList.querySelector(`.item${i}QtyInput`);
            const itemPriceInput= labelInvItemList.querySelector(`.item${i}PriceInput`);
            const labelItemTotal= labelInvItemList.querySelector(`.item${i}Total`);
            const btnItemDelete= labelInvItemList.querySelector(`.item${i}DeleteBtn`);
            itemNameInput.addEventListener('change', (e)=> {
                item.name=e.target.value;
                setStorage()});
            itemQtyInput.addEventListener('change', (e)=> {
                item.qty=e.target.value;
                setStorage();
                labelItemTotal.textContent=item.getItemTotalString()
            });
            itemPriceInput.addEventListener('change', (e)=> {
                item.price=e.target.value;
                setStorage();
                labelItemTotal.textContent=item.getItemTotalString();
            });
            btnItemDelete.addEventListener('click',(e)=>{
                items.splice(i,1);
                setStorage();
                renderItemsOnNewInv(items);
            });
        })
    }
}

//Individual invoice page
function renderInvoiceOnInvoicePage(sn){
    const targetInv=findInvoice(sn);
    labelInvStatus.textContent=`*${targetInv.status}*`;
    labelInvSn.textContent= `#${targetInv.sn}`;
    labelInvDescrip.textContent= targetInv.description;
    labelBillFromAddress.textContent=targetInv.billFrom.streetAddress;
    labelBillFromCity.textContent=targetInv.billFrom.city;
    labelBillFromPostCode.textContent=targetInv.billFrom.postCode;
    labelBillFromCountry.textContent=targetInv.billFrom.country;
    labelInvDate.textContent=targetInv.invDate;
    labelInvDueDate.textContent=targetInv.getDueDateString();
    labelBillToName.textContent=targetInv.billTo.name;
    labelBillToAddress.textContent=targetInv.billTo.streetAddress;
    labelBillToCity.textContent=targetInv.billTo.city;
    labelBillToPostCode.textContent=targetInv.billTo.postCode;
    labelBillToCountry.textContent=targetInv.billTo.country;
    labelBillToEmail.textContent=targetInv.billTo.email;
    labelInvTotalAmt.textContent=targetInv.getInvTotalString();
    
    if(targetInv.status==="Paid") {
        btnMarkUpPaid.classList.add('btn--hide');
        labelInvStatus.classList.remove('status--Draft');
        labelInvStatus.classList.remove('status--Pending');
        labelInvStatus.classList.add('status--Paid');
    };
    if(targetInv.status==="Pending") {
        btnMarkUpPaid.classList.remove('btn--hide');
        labelInvStatus.classList.remove('status--Draft');
        labelInvStatus.classList.remove('status--Paid');
        labelInvStatus.classList.add('status--Pending');
    };
    if(targetInv.status==="Draft") {
        btnMarkUpPaid.classList.remove('btn--hide');
        labelInvStatus.classList.remove('status--Pending');
        labelInvStatus.classList.remove('status--Paid');
        labelInvStatus.classList.add('status--Draft');
    };

    table.innerHTML=                      //reset Table content 
        `<tr class="text-1">
        <th class="item-description">Item Description</th>
        <th class="item-qty">QTY.</th>
        <th class="item-price">Price S$</th>
        <th class="item-total">Total S$</th>
        </tr>`;

    if(targetInv.items.length!=0){
        targetInv.items.forEach(item => {
            table.innerHTML+=
            `<tr class="text-2">
            <td class="item-description">${item.name}</td>
            <td class="item-qty">${item.qty}</td>
            <td class="item-price">${item.price.toLocaleString()}</td>
            <td class="item-total">${item.getItemTotalString()}</td>
            </tr>`
        });
    }
}


//Edit invoice Page
function openEditInvPage(){
    labelEditInvOverLay.classList.add('overlay--shown');
    editInvPageon=true;

    setStorage()
}

function closeEditInvPage(){
    if(labelEditInvOverLay.classList.contains('overlay--shown')) labelEditInvOverLay.classList.remove('overlay--shown');
    clearTempData();
    editInvPageon=false;

    setStorage()
}

function renderEditInvPage(sn){
    copyEditInvtoTempData(sn);
    renderSnOnEditInvPage(sn);
    renderEditInvPageFromTempStore();
}

function renderSnOnEditInvPage(sn){
    labelInvSn_EditInv.textContent=`# ${sn}`;
}

function renderEditInvPageFromTempStore(){    //UI update
    inputBillFromAddress_EditInv.value=tempBillFrom.streetAddress;
    inputBillFromCity_EditInv.value=tempBillFrom.city;
    inputBillFromPostCode_EditInv.value=tempBillFrom.postCode;
    inputBillFromCountry_EditInv.value=tempBillFrom.country;
    inputBillToName_EditInv.value=tempBillTo.name;
    inputBillToEmail_EditInv.value=tempBillTo.email;
    inputBillToAddress_EditInv.value=tempBillTo.streetAddress;
    inputBillToCity_EditInv.value=tempBillTo.city
    inputBillToPostCode_EditInv.value=tempBillTo.postCode;
    inputBillToCountry_EditInv.value=tempBillTo.country;
    inputInvDate_EditInv.value=tempInvDate;
    inputPayTerm_EditInv.value=tempPayTerm
    inputProjectDescrip_EditInv.value=tempProjDescrip;
    renderItemsOnEditInv(tempItems);
}


function renderItemsOnEditInv(items){
    labelInvItemList_EditInv.innerHTML="";
    if (items.length!=0){
        items.forEach((item,i)=>{
            labelInvItemList_EditInv.insertAdjacentHTML("beforeend", 
            `<div class="description-table-item-row grid-in-row">
            <input type="text" class="item-name-input text-2 item${i}NameInput" value="${item.name}">
            <input type="number" class="item-qty-input text-2 item${i}QtyInput" value="${item.qty}">
            <input type="number" class="item-price-input text-2 item${i}PriceInput" value="${item.price}">
            <p class="item-total-price text-2 item${i}Total">${item.getItemTotalString()}</p>
            <button class="btn btn--new-inovice-item-delete btn-text-2 item${i}DeleteBtn"><span class="icon-bin"></span></button>
            </div>`);
            //realtime monitoring of input change of item 
            const itemNameInput= labelInvItemList_EditInv.querySelector(`.item${i}NameInput`);
            const itemQtyInput= labelInvItemList_EditInv.querySelector(`.item${i}QtyInput`);
            const itemPriceInput= labelInvItemList_EditInv.querySelector(`.item${i}PriceInput`);
            const labelItemTotal= labelInvItemList_EditInv.querySelector(`.item${i}Total`);
            const btnItemDelete= labelInvItemList_EditInv.querySelector(`.item${i}DeleteBtn`);
            itemNameInput.addEventListener('change', (e)=> {
                item.name=e.target.value;
                setStorage()});
            itemQtyInput.addEventListener('change', (e)=> {
                item.qty=e.target.value;
                setStorage();
                labelItemTotal.textContent=item.getItemTotalString()
            });
            itemPriceInput.addEventListener('change', (e)=> {
                item.price=e.target.value;
                setStorage();
                labelItemTotal.textContent=item.getItemTotalString();
            });
            btnItemDelete.addEventListener('click',(e)=>{
                items.splice(i,1);
                setStorage();
                renderItemsOnEditInv(items);
            });
        })
    }
}

///////////////////////EVENT Listenser & Controller/////////////////////////////////////////////////////////////////////////////////
//Invoices Page 1
//Filter Bar
btnFilterBarBox.addEventListener("click", e=>{
    labelDropList.classList.toggle("droplist-shown")
    if(e.target.classList.contains("invoices__filter-droplist-item")) {
        const status= e.target.dataset.status;
        if (status==="All") labelFilterBarText.textContent ='Filter by Status';
        else labelFilterBarText.textContent = status;
        const filteredInv = filterInvoices(status);
        renderInvListOnInvsPage(filteredInv);
    }

});

btnFilterBarBox.addEventListener('mouseleave', e=>{
    if (labelDropList.classList.contains("droplist-shown")) labelDropList.classList.remove("droplist-shown");
})


//Invoices List item
labelInvList.addEventListener('click', e=>{
    const targetInv=e.target.closest('.invoices__list-item');
    if(targetInv){
    const invSn=targetInv.dataset.sn;
    targetEditInvSn=invSn; 
    openInvoicePage();
    renderInvoiceOnInvoicePage(invSn);
    }
    
 
});


//New Invoice Page
//Add item
btnAddNewItem.addEventListener('click', e=>{
    tempItems.push(new Item("","",""));
    renderItemsOnNewInv(tempItems);

    setStorage();
});
//Save Realtime input changes to tempdata
inputFields.forEach(e=>e.addEventListener('change',saveNewInvoiceTempData));
inputPayTerm.addEventListener('change', saveNewInvoiceTempData);
//Open New or Dischard New Invoice Page 
btnCreatNewInvoice.addEventListener('click', openNewInvPage);
btnDischardNewInv.addEventListener('click', closeNewInvPage);
//Save New invoices as Draft
btnSaveNewInvDraft.addEventListener('click', e=>{
    invoices.push(new Invoice(tempBillFrom, tempBillTo, tempInvDate, tempPayTerm, tempProjDescrip, tempItems, "Draft"))
    closeNewInvPage();
    renderInvListOnInvsPage(invoices);
})
//Save and Send New invoices as Pending
btnSaveSendNewInv.addEventListener('click', (e)=>{
    const inputNodeList = labelNewInvOverLay.querySelectorAll('input');
    const inputNodeArray= Array.prototype.slice.call(inputNodeList); //convert NodeList to Array List
    if (inputNodeArray.some((input)=> input.value==="")){
        alert('Some Input Field is empty, Please check');
        return;
    }
    invoices.push(new Invoice(tempBillFrom,tempBillTo, tempInvDate, tempPayTerm, tempProjDescrip, tempItems, "Pending"))
    closeNewInvPage();
    renderInvListOnInvsPage(invoices);
})


//--On Invoice Page2
//go back to Invoices Page
btnGoBack.addEventListener('click', ()=>{
    openInvoicesPage();
    renderInvListOnInvsPage(invoices)
});

 //go to Edit inv page
btnEditInvoice.addEventListener('click', (e)=>{
    openEditInvPage();
    renderEditInvPage(targetEditInvSn);
});
btnDeleteInvoice.addEventListener('click', e=>{
    deleteInvoice(targetEditInvSn);
    openInvoicesPage();
    renderInvListOnInvsPage(invoices)
});
btnMarkUpPaid.addEventListener('click',e=>{
    const targetInv=findInvoice(targetEditInvSn);
    console.log()
    if (targetInv.status==="Draft") {
        alert("this is draft invoice, please edit and save it to Pending status first");
        return;
    }
    targetInv.status="Paid";
    renderInvoiceOnInvoicePage(targetEditInvSn);

    setStorage();
})




//--On Edit Invoice Page
btnCancelEdit.addEventListener('click',closeEditInvPage);
btnSaveDraftEdit.addEventListener('click', (e)=>{
    const targetInv= findInvoice(targetEditInvSn);
    targetInv.updateInvoice(tempBillFrom,tempBillTo,tempInvDate, tempPayTerm,tempProjDescrip,tempItems,"Draft");
    closeEditInvPage();
    targetEditInvSn=targetInv.sn;
    renderInvoiceOnInvoicePage(targetEditInvSn);
});
btnSaveSendEdit.addEventListener('click', (e)=>{
    const inputNodeList = labelEditInvOverLay.querySelectorAll('input');
    const inputNodeArray= Array.prototype.slice.call(inputNodeList); //convert NodeList to Array List
    if (inputNodeArray.some((input)=> input.value==="")){
        alert('Some Input Field is empty, Please check');
        return;
    }
    const targetInv= findInvoice(targetEditInvSn);
    targetInv.updateInvoice(tempBillFrom,tempBillTo,tempInvDate, tempPayTerm,tempProjDescrip,tempItems,"Pending");
    closeEditInvPage();
    targetEditInvSn=targetInv.sn;
    renderInvoiceOnInvoicePage(targetEditInvSn);
});


//Save Realtime input changes to tempdata
inputFields_EditInv.forEach(e=>e.addEventListener('change',saveEditInvoiceTempData));
inputPayTerm_EditInv.addEventListener('change', saveEditInvoiceTempData);
//addnew item
btnAddNewItem_EditInv.addEventListener('click', e=>{
    tempItems.push(new Item("","",""));
    renderItemsOnEditInv(tempItems);
    setStorage();
});


////////////////////Initialize ////////////////////////////////////////////////////  

//restore stored pages

function start(){
    getFromStorage();
    if (mainPageOn){
        openInvoicesPage();
        renderInvListOnInvsPage(filterInvoices(filterKeyWord));
        if (newInvPageOn){
            openNewInvPage();
            renderInvPageFromTempStore();
        };
    }
    if (invPageOn){
        openInvoicePage();
        renderInvoiceOnInvoicePage(targetEditInvSn);
        if(editInvPageon){
            openEditInvPage();
            renderSnOnEditInvPage(targetEditInvSn);
            renderEditInvPageFromTempStore();
        }
    }
}

//////////////////// Local Storage to remember current data and restore back


function setStorage(){
    const variables={
        var0: invNumber,
        var1: targetEditInvSn,
        var2: tempBillFrom,
        var3: tempBillTo,
        var4: tempInvDate,
        var5: tempProjDescrip,
        var6: tempPayTerm,
        var7: tempItems,
        var8: filterKeyWord,
        var9: mainPageOn,
        var10: newInvPageOn,
        var11: invPageOn,
        var12: editInvPageon,
        var13: invoices,
    };
    localStorage.setItem('variables',JSON.stringify(variables));
    console.log("store done");
}


function getFromStorage(){
    let variables=JSON.parse(localStorage.getItem('variables'));
    if(!variables) return;
    targetEditInvSn=variables.var1;
    tempBillFrom=new BillFrom(
        variables.var2.streetAddress, 
        variables.var2.city, 
        variables.var2.postCode,
        variables.var2.country);
    tempBillTo=new BillTo(
        variables.var3.name,
        variables.var3.email,
        variables.var3.streetAddress,
        variables.var3.city,
        variables.var3.postCode,
        variables.var3.country, )
   tempInvDate=variables.var4;
   tempProjDescrip=variables.var5;
   tempPayTerm=variables.var6,
   tempItems=variables.var7.map(e=>new Item(e.name,e.qty,e.price));
   filterKeyWord=variables.var8;
   mainPageOn=variables.var9;
   newInvPageOn=variables.var10;
   invPageOn=variables.var11;
   editInvPageon=variables.var12;
   invoices=variables.var13.map(e=>{
       const invoice = new Invoice(
           new BillFrom(
               e.billFrom.streetAddress,
               e.billFrom.city,
               e.billFrom.postCode,
               e.billFrom.country)
            ,
            new BillTo(
                e.billTo.name,
                e.billTo.email,
                e.billTo.streetAddress,
                e.billTo.city,
                e.billTo.postCode,
                e.billTo.country)
            ,
            e.invDate, 
            e.payTerm, 
            e.description, 
            e.items.map(el=>new Item(el.name,el.qty,el.price)),
            e.status);
        invoice.sn=e.sn;
        return invoice;
       });
    invNumber=variables.var0;

}

const btnLightMode=document.querySelector('.btn--light-mode');
btnLightMode.addEventListener('click',e=>{
    const currentTheme=document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    const btntext=document.querySelector(".light-btn-text")
    btntext.textContent= newTheme=== "dark" ? "Light Mode" : "Dark Mode";
})

window.addEventListener('load', start);
var abc=5;
console.log(abc);
