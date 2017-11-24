var tempoInicial = $("#tempo-digitacao").text();
var campo = $(".campo-digitacao");

$(document).ready(function(){
    atualizaTamanhoFrase();
    inicializaContadores();
    inicializaCronometro();
    inicializaMarcadores();
    $("#botao-reiniciar").on("click", reiniciaJogo);
    atualizaPlacar();
    $("#usuarios").selectize({
        create: true,
        sortField: 'text'
    })
});

function atualizaTempoInicial(tempo){
    tempoInicial = tempo;
    $("#tempo-digitacao").text(tempo);
}

function atualizaTamanhoFrase(){
    var frase = $(".frase").text();
    var numPalavras = frase.split(" ").length;
    var tamanhoFrase = $("#tamanho-frase");
    tamanhoFrase.text(numPalavras);
}

function inicializaContadores(){
    campo.on("input", function(){
            var qtdPalavras = this.value.split(/\s+/).length -1;
            $("#contador-palavras").text(qtdPalavras);
        
            var qtdCaracteres = this.value.length;
            $("#contador-caracteres").text(qtdCaracteres);
        });
}

function inicializaCronometro(){
    
    campo.one("focus", function(){
            var tempoRestante = $("#tempo-digitacao").text();
            var cronometroId = setInterval(function(){
            tempoRestante--;
            $("#tempo-digitacao").text(tempoRestante);
            if(tempoRestante <= 0){
                clearInterval(cronometroId);
                finalizaJogo();
            }
        },1000);
    })
}

function finalizaJogo(){
    //alert("Game Over - Seu tempo acabou!");
    campo.attr("disabled", true);
    campo.addClass("campo-desativado");
    inserePlacar();
}

function inicializaMarcadores(){
    
    campo.on("input",function(){
        var frase = $(".frase").text();
        var digitado = campo.val();
        var comparavel = frase.substr(0,digitado.length);
    
        if(digitado == comparavel){
            campo.addClass("digitadoCorreto");
            campo.removeClass("digitadoIncorreto");
        }else{
            campo.addClass("digitadoIncorreto");
            campo.removeClass("digitadoCorreto");
        }
    })
}

$("#botao-placar").click(mostraPlacar);

$("#botao-sync").click(sincronizaPlacar);


function mostraPlacar(){
    $(".placar").stop().slideToggle(500);
}

function inserePlacar(){
    var corpoTabela = $(".placar").find("tbody");
    var usuario = $("#usuarios").val();
    var numeroPalavras = $("#contador-palavras").text();
    
    var linha = novaLinha(usuario, numeroPalavras);
    linha.find(".botao-remover").click(removeLinha);

    corpoTabela.append(linha);
    $(".placar").slideDown(500);
    scrollPlacar();
}

function scrollPlacar() {
    var posicaoPlacar = $(".placar").offset().top;

    $("body").animate(
    {
        scrollBottom: posicaoPlacar + "px"
    }, 1000);
}

function novaLinha(usuario,palavras){
    var linha = $("<tr>");
    var colunaUsuario = $("<td>").text(usuario);
    var colunaPalavras = $("<td>").text(palavras);
    var colunaRemover = $("<td>");
    
    var link = $("<a>").addClass("botao-remover").attr("href","#");
    var icone = $("<i>").addClass("small").addClass("material-icons").text("delete");

    link.append(icone);
    colunaRemover.append(link);
    linha.append(colunaUsuario);
    linha.append(colunaPalavras);
    linha.append(colunaRemover);

    return linha;
}

function removeLinha(){
    event.preventDefault();
    var linha = $(this).parent().parent();
    linha.fadeOut();
    setTimeout(function(){
        linha.remove();
    },1000);
}

function sincronizaPlacar(){
    var placar = [];
    var linhas = $("tbody>tr");
    linhas.each(function(){
        var usuario = $(this).find("td:nth-child(1)").text();
        var palavras = $(this).find("td:nth-child(2)").text();

        var score = {
            usuario: usuario,
            pontos: palavras
        };
        placar.push(score);
    });
    var dados = {
        placar: placar
    };
    $.post("http://localhost:3000/placar", dados, function(){

    });
}

function atualizaPlacar(){
    $.get("http://localhost:3000/placar", function(data){
        $(data).each(function(){
            var linha = novaLinha(this.usuario, this.pontos);
            linha.find(".botao-remover").click(removeLinha);
            $("tbody").append(linha);
        })
    })
}

function reiniciaJogo(){
    campo.attr("disabled", false);
    campo.val("");
    $("#tempo-digitacao").text(tempoInicial);
    $("#contador-caracteres").text(0);
    $("#contador-palavras").text(0);
    inicializaCronometro();
    campo.addClass("campo-ativado");
    campo.removeClass("digitadoIncorreto");
    campo.removeClass("digitadoCorreto");
}