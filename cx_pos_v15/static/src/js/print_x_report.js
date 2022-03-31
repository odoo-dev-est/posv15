function printXReport() {
    const url = 'http://localhost:12376/orders/print_X_report/';

    const options = {
        method:'GET'
    };

    fetch(url, options)
              .then(data => {
                  if (!data.ok) {
                    throw Error(data.status);
                  }
                   
                  if(data.status === 200){
                      alert("X Report Printed!");
                  }
          
                  return data.json();

                    }).then(data => {
                        console.log(data);

                    }).catch(e => {
                      console.log(e);
                    });

}