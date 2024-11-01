const convertors = {
  real(currency) {
    const currencyParsed = parseFloat(currency);
    const currencyTaxToReal = 0.068;

    return currencyParsed * currencyTaxToReal;
  },
  dollar(currency) {
    const currencyParsed = parseFloat(currency);
    const currencyTaxToReal = 0.012;

    return currencyParsed * currencyTaxToReal;
  },
};

const averagesLabels = {
  under: {
    text: "subprecificado",
    style: "color: #1abc9c;"
  },
  average: {
    text: "preço justo",
    style: "color: #ecf0f1;"
  },
  over: {
    text: "sobreprecificado",
    style: "color: #e74c3c;"
  }
}

function generateAverageRange(average) {

  return { min: average - average * 0.1, max: average + average * 0.1 }
}

function returnLabel(minAndMax, value) {  
  if (value >= minAndMax.min && value <= minAndMax.max) {
    return "average"
  } else if(value < minAndMax.min) {
    return "under"
  } else {
    return "over"
  }
}

function convertMetersToFeet(value) {
  return value * 3.28084;
}

handlePredict = async () => {
  const currency = document.getElementById("currency").value;
  const areaInSquareMeters = document.getElementById("area").value;
  const roomsNumber = document.getElementById("rooms").value;
  const bathroomsNumber = document.getElementById("bathrooms").value;
  const location = document.getElementById("location").value;
  const responseDiv = document.getElementById("response");

  const formBody = `total_sqft=${encodeURIComponent(
    convertMetersToFeet(parseFloat(areaInSquareMeters))
  )}&location=${encodeURIComponent(location)}&bhk=${encodeURIComponent(
    roomsNumber
  )}&bath=${encodeURIComponent(bathroomsNumber)}`;

  const url =
    "http://localhost:5000";

    

  try {
    const response = await fetch(`${url}/predict_home_price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    

    const parsedResponse = await response.json()    
    const estimatedPrice = parseFloat(parsedResponse.estimated_price);    

    if (!parsedResponse.estimated_price) {
      throw new Error("Preço estimado não retornado!");
      responseDiv.innerHTML = "<p class='text' style='text-align: center;'>Erro inesperado durante a predição, tente mais tarde...</p>"
    }

    const lahkValue = 100000;
    const convertedHousePrice = convertors[currency](
      estimatedPrice * lahkValue
    );
    const referencePrice = currency === "real" ?  651217 :  115123.12
    const averageRange = generateAverageRange(referencePrice)
    const labels = returnLabel(averageRange, referencePrice) 

    const usFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    const brFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const selectedFormatter = currency === "real" ? brFormatter : usFormatter;


    responseDiv.innerHTML =`<p class="text" style='text-align: center;${averagesLabels[labels].style}'>${selectedFormatter.format(convertedHousePrice)} ${averagesLabels[labels].text}</p>`
  } catch (error) {
    console.error("[ERROR] handlePredict", error);
  }
};

currencyChange = () => {
  let selectedValue = currency.value;
  document.getElementById("currency-change-1").innerHTML = selectedValue;
  document.getElementById("currency-change-2").innerHTML = selectedValue;
  document.getElementById("currency-change-3").innerHTML = selectedValue;
};

commas = (x) => {
  let amount = document.getElementById("investment").value;
  let temp = amount.split(" ");
  if (temp.includes("Rs")) {
    amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("investment").value = amount
      .concat(" ")
      .concat("Rs");
  }
};
percentage = (x) => {
  let value = document.getElementById("return-rate").value;
  let temp = value.split(" ");
  if (temp.length < 2)
    document.getElementById("return-rate").value = value
      .concat(" ")
      .concat("%");
};
