const weaviate = require("weaviate-client");
const fs = require("fs");
const { parse } = require("csv-parse");
const express=require('express')
const app=express()


const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
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


const addData=async(dat)=>{
   let added= await client.data.creator()
    .withClassName('Product')
    .withProperties({
        title:dat[0],
        description:dat[1],
        availibility:dat[2],
        condition:dat[3],
        price:dat[4],
        link:dat[5],
        mage_link:dat[6],
        brand:dat[7],
        category:dat[8],
        subCategory:dat[9],
        length:dat[10],
        colour:dat[11],
        pattern:dat[12],
        fit:dat[13]
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
  

fs.createReadStream("data.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {

    productData.push({
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
    // addData(row).then(res=>{
    //         console.log(`the data has been indexed properly ${res}`)
              
    //     }).catch(err=>{
    //         console.log('error')
    //     })

  })
  .on("end", function () {
    console.log("finished");
    console.log(productData)
    json=JSON.stringify(productData,null,2)
    return productData
  })
  .on("error", function (error) {
    console.log(error.message);
  });

}

const queryingDatabase=async(text)=>{
    let data = await client.graphql
        .get()
        .withClassName('Product')
        .withFields(['idd','availability','condition','price','link','image_link','mpn','brand','google_product_category','product_type	custom_label_1','custom_label_2	custom_label_3','title','description','promotion_id'])
        .withNearText({
            concepts: [text],
            certainty: 0.9
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


checkSchemaClass().then(()=>{
    console.log('the classe in the local system if no classe are present run the schema for creating the class')
   
}).catch(err=>{
    console.log('error buddy')
})






//----------------------------------------------------------BULKINDEXING--------------------------------------------------------------------
// bulkIndexing()

//------------------------------------------------------------ENDING---------------------------------------------------

//-----------------------------------------------------QUERY---------------------------------------------------
// queryingDatabase('i want to buy a floral dress').then(res=>{
//     console.log(res)
// }).catch(err=>{
//     console.log(err)
// })
//-------------------------------------------------------------ENDING-----------------------------------------------------------------------



//--------------------------------------------------------------DELETE-----------------------------------------------------------------
// deletClass('Product')
//---------------------------------------------------------------ENDING-----------------------------------------------------------------------


viewProducts()
app.use(express.json());
app.listen(8000,(err)=>{
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