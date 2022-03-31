//close cashier
function closeCashier() {
    const url = 'http://localhost:12376/orders/cashier_close/';

    const options = {
        method:'GET'
    };

    fetch(url, options)
              .then(data => {
                  if (!data.ok) {
                    throw Error(data.status);
                  }
                   
                  if(data.status === 200){
                      alert("Cashier is closed!");
                  }
          
                  return data.json();

                    }).then(data => {
                        console.log(data);

                    }).catch(e => {
                      console.log(e);
                    });

}