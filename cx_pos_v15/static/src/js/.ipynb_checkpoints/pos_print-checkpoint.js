odoo.define('cx_pos_v15.print', function (require) {
    "use strict";

    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const ReceiptScreen = require('point_of_sale.ReceiptScreen');
    const Registries = require('point_of_sale.Registries');
    const pos_model = require('point_of_sale.models');

    //Load printer_id and register_id fields
    pos_model.load_fields('account.tax', ['printer_id']);
    pos_model.load_fields('pos.payment.method',['register_id']);

    //Start cashier in Fiscal Printer Machine
    class StartCashier extends PosComponent {
      async onClick() {
        let domain = [['cashier_id.name', '=', this.env.pos.employee.name]];

        this.rpc({
          model: "pos.cashier",
          method: 'search_read',
          args: [domain, ['cashier_code']],
          kwargs: {limit: 1},

        }).then(result =>{
            const url = 'http://localhost:12376/orders/cashier_init/';
            const json = {
                      code: Number(result[0].cashier_code)
                    };

            const options = {
                      method:'POST',
                      headers:{
                          'accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(json),
                  };

            fetch(url,options)
              .then(data => {
                if (!data.ok) {
                  throw Error(data.status);
                }
                
                if(data.status === 200){
                    alert("Session started");
                }
        
                return data.json();

                  }).then(json => {
                      console.log(json);

                  }).catch(e => {
                    console.log(e);
                  });
        })
      }
    }
    StartCashier.template = 'StartCashier';
    ProductScreen.addControlButton({
        component: StartCashier,
        condition: function(){
          return true;
        },
    });
    Registries.Component.add(StartCashier);
    
    
    //Print Receipt By API Button
    const PrintByApi =  (ReceiptScreen) =>
      class extends ReceiptScreen {
        constructor(){
          super(...arguments);
        }
        printByApi(){
          let order = this.env.pos.get_order();
          let order_for_print = order.export_for_printing();
          let payment_methods = this.env.pos.payment_methods;

          console.log(order_for_print);
          console.log(order);

          let end_point = "/orders/post_invoice/";
          let invoiceNumber = order.uid;
          let fiscal_printer_code = order.code_value;
          let date = order.formatted_validation_date;

          let totalPrice = order_for_print.total_without_tax;

          let products = [];
          let totalDiscount = false;

          //Get product data from order lines
          for (let index=0; index < order_for_print.orderlines.length; index++){
              let {product_name, price, quantity, price_with_tax_before_discount, discount} = order_for_print.orderlines[index];

              //Set total discount if exists
              if(((/Descuento/).test(product_name) || (/Discount/).test(product_name)) && price <= 0){
                price *= -1;
                totalDiscount = Math.round((price/(totalPrice + price))*10000);

              } else{

                //PerAmount set false by default. Not implemented in Odoo yet.
                if (discount > 0){
                  let size = discount*100;
                  discount = { 
                    PerAmount:false,
                    size:size
                  };
                } else{
                  discount = { 
                    PerAmount:false,
                    size:0
                  };
                }

                // Default code and surcharge values. Not implemented in Odoo yet
                /*let code = 0;
                let surcharge = { 
                  PerAmount: false,
                  size: 0
                };*/
                
                //Convert price and quantity to values fiscal printer can accept
                if(quantity < 0) quantity *=-1;
                if(price_with_tax_before_discount < 0) price_with_tax_before_discount *=-1;

                let tax = Math.round(((price_with_tax_before_discount/quantity)/price - 1)*100);
                price *= 100;
                quantity *= 1000;
                products.push({tax:tax,
                              price:price,
                              quantity: quantity,
                              // code:code,
                              description:product_name,
                              discount: discount,
                              // surcharge: surcharge
                            });

              }
            } 

          //Set tax index registered in fiscal printed
          let taxes = order_for_print.tax_details;
          for(let t_index = 0; t_index < taxes.length; t_index++){
            for(let p_index = 0; p_index < products.length; p_index++){

              if(products[p_index].tax === taxes[t_index].tax.amount){
                products[p_index].tax = taxes[t_index].tax.printer_id;
              } 
            }
          }

          //set payment methods
          let paymentlines = order_for_print.paymentlines;
          let partialPay = [];

          for(let pm_index =0; pm_index < payment_methods.length; pm_index++){
              for(let pl_index=0; pl_index < paymentlines.length; pl_index++){
                if(paymentlines[pl_index].name === payment_methods[pm_index].name){
                      partialPay.push(
                    {
                      ID: payment_methods[pm_index].register_id,
                      amount: paymentlines[pl_index].amount*100
                    }
                  )
                }
              }
            }

          for(let pm_index=0; pm_index < partialPay.length; pm_index++){
            if(partialPay[pm_index].amount < 0) partialPay[pm_index].amount *= -1;
          }
  

          //Make receipt print request
          const receipt = {
              client: {
                ID: order_for_print.client.vat || "",
                bussinessName: order_for_print.client.name || "",
                additionalInfo: `${order_for_print.client.address || ""}, ${order_for_print.client.mobile || ""}`
              },
              invoiceComment: "",
              products:products,
              // discount: {
              //   PerAmount: true,
              //   size: 0
              // },
              // surcharge: {
              //   PerAmount: false,
              //   size: 0
              // },
              partialPay: partialPay,
              // partialPay: [
              //   {
              //     ID: 0,
              //     amount: 0
              //   }
              // ],
              // totalPay: totalPay,
              // barCode: 0
            };

            if(totalDiscount){
              receipt.discount = {
                PerAmount: false,
                size: totalDiscount
              };
            }

          //check if credit note
          if(order.return_ref && fiscal_printer_code){
            end_point = "/orders/post_creditnote/";
            invoiceNumber = Number(order.return_ref.split(' ')[1].split('-').join(''));
            date = date.split(' ')[0];

            receipt.invoiceNumber = invoiceNumber;
            receipt.fiscalPrinter = fiscal_printer_code;
            receipt.date = date;
            
          } 
        
          const options = {
              method: 'POST',
              headers: {
                'Access-Control-Allow-Origin': '*',
                'accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(receipt),
            };
        
          let url = `http://127.0.0.1:12376${end_point}`;
        
          fetch(url, options)
            .then(data => {
                if (!data.ok) {
                  throw Error(data.status);
                }
        
                return data.json();
        
                  }).then(receipt => {
                    console.log(receipt);
                    
                  }).catch(e => {
                    console.log(e);
                  });

      }    
    }
    Registries.Component.extend(ReceiptScreen, PrintByApi);

});