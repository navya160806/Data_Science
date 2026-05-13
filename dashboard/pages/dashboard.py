import  streamlit as st
import seaborn as sns
import plotly.express as px

st.title("explore the insights of car crashes data")

df=sns.load_dataset("car_crashes")
st.dataframe(df)

#Percentage of speeding activities
fig= px.bar(df,x='abbrev',y='total',
            title='total accidents by state',
            labels={'abbrev':'State','total':'Total Accidents'},
            template='plotly_dark',
            color='total')
fig.show()

#top10 state by insurance prenium 
top10=df.sort_values('ins_premium',ascending=False).head(10)
fig=px.bar(top10,x='abbrev',y='ins_premium',color='ins_premium',
           title='Top10 states by insurance premium',
           labels={'abbrev':'state','ins_premium':'insurance premium'}
           )
fig.show()

#PIE CHART
fig = px.pie(df,values='speeding',names='abbrev',
             title='percengtage of speeding accident',
             color_discrete_sequence=px.colors.sequential.RdBu)
fig.update_traces(textposition='inside')
 
st.plotly 