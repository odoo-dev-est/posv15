//Register Payment method function
function registerPaymentMethod(){
    let payment_method_name = document.getElementsByName("name")[0].outerText;
    let id = document.getElementsByName("register_id")[0].outerText;

    //Make payment method registration request
    const payment_method = {
        ID: Number(id),
        descriptor: payment_method_name 
    };

    const options = {
        method: 'POST',
        headers: {
        //   'Access-Control-Allow-Origin': '*',
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payment_method),
      };
  
    const url = 'http://localhost:12376/orders/payments_register/';

    fetch(url, options)
              .then(data => {
                  if (!data.ok) {
                    throw Error(data.status);
                  }
          
                  return data.json();
          
                    }).then(payment_method => {
                      console.log(payment_method);
                      alert(`Payment method registered: ${payment_method_name} with id ${id}`);

                    }).catch(e => {
                      console.log(e);
                    });

}