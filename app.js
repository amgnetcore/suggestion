const weaviate = require("weaviate-client");
const fs = require("fs");
const { parse } = require("csv-parse");
const express=require('express')
const app=express()


const client = weaviate.client({
    scheme: "http",
    host: "localhost:3003",
  });

  const checkSchemaClass= async()=>{
    const schemaRes = await client.schema.getter().do();
    console.log(schemaRes);
  }
  let json

let productData=[]
const creatSchema=async()=>{
    const schemaConfig = {
        'class': 'Product',
        // 'vectorizer': 'text2vec',
        'vectorIndexType': 'hnsw',
        'properties': [
            {
                'name': 'title',
                'dataType': ['string']
            },
            {
                'name': 'description',
                'dataType': ['string']
            },
            {
                'name': 'availibility',
                'dataType': ['string']
            },
            {
                'name': 'condition',
                'dataType': ['string']
            },
            {
                'name': 'price',
                'dataType': ['string']
            },
            {
                'name': 'link',
                'dataType': ['string']
            },
            {
                'name': 'image_link',
                'dataType': ['string']
            },
            {
                'name': 'brand',
                'dataType': ['string']
            },
            {
                'name': 'category',
                'dataType': ['string']
            },
            {
                'name': 'subCategory',
                'dataType': ['string']
            },
            {
                'name': 'length',
                'dataType': ['string']
            },{
                'name': 'colour',
                'dataType': ['string']
            },{
                'name': 'pattern',
                'dataType': ['string']
            },
            {
                'name': 'fit',
                'dataType': ['string']
            }
        ]
    }
    
    await client.schema
        .classCreator()
        .withClass(schemaConfig)
        .do();
}



"title","description","availibility","condition","price","link","mage_link","brand","category","subCategory","length","colour","pattern","fit"

const addData=async(row)=>{
   let added= await client.data.creator()
    .withClassName('Product')
    .withProperties({
        title:row[0],
        description:row[1],
        availibility:row[2],
        condition:row[3],
        price:row[4],
        link:row[5],
        mage_link:row[6],
        brand:row[7],
        category:row[8],
        subCategory:row[9],
        length:row[10],
        colour:row[11],
        pattern:row[12],
        fit:row[13]
    })
    .do()
    return added
}

async function viewProducts() {

    let products=await client.data.getter().do()
    console.log(products)
    
   
  }
 let deletClass=async (className)=>{
    client.schema
  .classDeleter()
  .withClassName(className)
  .do()
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.error(err)
  });
 }
  
 

const bulkIndexing=()=>{
  
    const results = [];
fs.createReadStream("data.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    results.push(row);
    // productData.push({
    //     title:row[0],
    //     description:row[1],
    //     availibility:row[2],
    //     condition:row[3],
    //     price:row[4],
    //     link:row[5],
    //     mage_link:row[6],
    //     brand:row[7],
    //     category:row[8],
    //     subCategory:row[9],
    //     length:row[10],
    //     colour:row[11],
    //     pattern:row[12],
    //     fit:row[13]
    // })
    // addData(row).then(res=>{
    //         console.log(`the data has been indexed properly ${res}`)
              
    //     }).catch(err=>{
    //         console.log('error')
    //     })

  })
  .on("end", function () {
    for(const row of results){
        addData(row).then(res=>{
            console.log(`the data has been indexed properly ${res}`)
              
        }).catch(err=>{
            console.log('error')
        })
    }
  })
  .on("error", function (error) {
    console.log(error.message);
  });

}
//'idd','availability','condition','price','link','image_link','mpn','brand','google_product_category','product_type	custom_label_1','custom_label_2	custom_label_3','title','description','promotion_id'

const queryingDatabase=async(text)=>{
    let data = await client.graphql
        .get()
        .withClassName('Product')
        .withFields(['title','description','availibility','condition','price','link','mage_link','brand','category','subCategory','length','colour','pattern','fit'])
        .withNearText({
            concepts: [text],
            certainty: 0.6
        })
        .withLimit(4)
        .do()
        .then(info => {
            return info
        })
        .catch(err => {
            console.error(err)
        });
    return data;
}

//--------------------------------------------------------------creating schema run one time in machine -------------------------------------------
// creatSchema().then(err=>{
//    console.log('schema has been created sucesfully')
// }).catch(err=>{
//     console.log(`there is a reeor while creating the schema ${err}`)
// })
//---------------------------------------------------------------Ends over here--------------------------------------------------------------------


// checkSchemaClass().then(()=>{
//     console.log('the classe in the local system if no classe are present run the schema for creating the class')
   
// }).catch(err=>{
//     console.log('error buddy')
// })






//----------------------------------------------------------BULKINDEXING--------------------------------------------------------------------
// bulkIndexing()
// deletClass()
//------------------------------------------------------------ENDING---------------------------------------------------

//-----------------------------------------------------QUERY---------------------------------------------------
queryingDatabase('red dress').then(res=>{
    console.log(res)
}).catch(err=>{
    console.log(err)
})
//-------------------------------------------------------------ENDING-----------------------------------------------------------------------



//--------------------------------------------------------------DELETE-----------------------------------------------------------------
// deletClass('Product')
//---------------------------------------------------------------ENDING-----------------------------------------------------------------------

// 
// viewProducts()
// queryingDatabase('red dress')

app.use(express.json());
app.listen(4000,(err)=>{
   if(!err){
     console.log('the port is running sucesfully')
   }else{
    console.log(`ther has been some error running the port ${err}`)
   }
})

app.get('/',(req,res)=>{
     let text=req.body.text
     queryingDatabase(text).then(rs=>{
           res.send(rs)
           res.status(200)
        }).catch(err=>{
            console.log(err)
        })

   
})

// app.get('/movies',(req,res)=>{
//     let text=req.body.text
//     queryingDatabaseMovie(text).then(rs=>{
//         res.send(rs)
//         res.status(200)
//      }).catch(err=>{
//          console.log(err)
//      })

// })