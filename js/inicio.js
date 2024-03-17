function buscarNumero() {
    var input = document.getElementById("buscar").value;
    var tdList = document.querySelectorAll(".matriz td");
  
    for (var i = 0; i < tdList.length; i++) {
      var td = tdList[i];
      var numero = td.textContent.trim();
  
      if (numero === input) {
        td.style.transition = "font-size 0.5s ease";
        td.style.fontSize = "50px";
  
        td.style.cursor = "pointer";
  
        setTimeout(function() {
          td.style.fontSize = "20px";
          td.style.cursor = "auto"; 
        }, 1500);
  
        td.scrollIntoView();
        break;
      }
    }
  }
  window.onscroll = function() {
    var btn = document.getElementById("scrollToTopBtn");
  
    if (window.pageYOffset > 0) {
      if (btn.style.display === "none") {
        btn.style.animation = "slidein 3s alternate";
        btn.style.display = "block";
      }
     
    } else {
      if (btn.style.display !== "none") {
        btn.style.animation = "slideout 3s alternate";
  
        btn.addEventListener("animationend", function() {
          btn.style.display = "none";
        }, { once: true });
      }
    }
  };
  
    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  
    let selectedNumbers = []; 
  
    function addToCount(numero) {
    var index = selectedNumbers.indexOf(numero);
  
    if (index !== -1) {
      selectedNumbers.splice(index, 1);
      document.getElementById("numero-" + numero).style.backgroundColor = "#222222";
    } else {
      selectedNumbers.push(numero);
      document.getElementById("numero-" + numero).style.backgroundColor = "#375a7f";
    }
  
    document.getElementById("count").value = selectedNumbers.join("-");
  }
    function deleteLastNumber() {
      const lastNumber = selectedNumbers.pop(); 
      document.getElementById("numero-" + lastNumber).style.backgroundColor = "#222222"; 
      document.getElementById("count").value = selectedNumbers.join("-"); 
    }
    function validateAndSetFormAction() {
      var countInput = document.getElementById("count");
      var form = document.querySelector("form");
      var countValue = countInput.value;
  
      if (countValue === "") {
        Toastify({
          text: "Por favor, seleccione los números.",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#343a40",
        }).showToast();
  
        return false; 
      }
  
      form.action = "/guardar/" + countValue;
  
      return true;
    }